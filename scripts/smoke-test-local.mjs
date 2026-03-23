const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8888';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const SSE_TIMEOUT_MS = Number(process.env.SSE_TIMEOUT_MS ?? 180000);
const suffix = Date.now().toString(36);

function createCookieJar() {
  return {
    store: new Map(),
    apply(headers = {}) {
      const cookies = [...this.store.entries()]
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');

      if (cookies) {
        headers.Cookie = cookies;
      }

      return headers;
    },
    capture(response) {
      const setCookie = response.headers.getSetCookie?.() ?? [];
      for (const cookie of setCookie) {
        const [pair] = cookie.split(';');
        const [name, value] = pair.split('=');
        if (value === '') {
          this.store.delete(name);
        } else {
          this.store.set(name, value);
        }
      }
    },
  };
}

async function requestJson(path, { method = 'GET', body, cookieJar, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Origin: FRONTEND_URL,
      'Content-Type': body ? 'application/json' : undefined,
      ...cookieJar?.apply(headers),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  cookieJar?.capture(response);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  return { response, json };
}

async function waitForGuideCompletion(guideId, cookieJar) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < SSE_TIMEOUT_MS) {
    const { response, json } = await requestJson(`/api/v1/work-guides/${guideId}`, {
      cookieJar,
    });

    if (!response.ok) {
      throw new Error(`Guide polling failed with ${response.status}`);
    }

    if (json.status === 'COMPLETED') {
      return json;
    }

    if (json.status === 'FAILED') {
      throw new Error(`Guide generation failed: ${json.errorMessage ?? 'unknown error'}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Guide generation timed out');
}

async function waitForSseEvent(guideId, cookieJar) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SSE_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/work-guides/${guideId}/events`, {
      headers: cookieJar.apply({ Origin: FRONTEND_URL }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`SSE request failed with ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('SSE response body missing');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        throw new Error('SSE stream closed before receiving an event');
      }

      buffer += decoder.decode(value, { stream: true });
      const match = buffer.match(/data:\s*(.+)\n\n/);

      if (match) {
        return JSON.parse(match[1]);
      }
    }
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}

async function main() {
  const userA = {
    fullName: 'Smoke Teacher A',
    email: `smoke-a-${suffix}@example.com`,
    password: 'password123',
  };
  const userB = {
    fullName: 'Smoke Teacher B',
    email: `smoke-b-${suffix}@example.com`,
    password: 'password123',
  };

  const jarA = createCookieJar();
  const jarB = createCookieJar();

  const registerA = await requestJson('/api/v1/auth/register', {
    method: 'POST',
    body: userA,
    cookieJar: jarA,
  });
  if (registerA.response.status !== 201) {
    throw new Error(`Register A failed: ${registerA.response.status}`);
  }

  if (registerA.response.headers.get('access-control-allow-origin') !== FRONTEND_URL) {
    throw new Error('CORS origin header did not match FRONTEND_URL');
  }

  if (registerA.response.headers.get('access-control-allow-credentials') !== 'true') {
    throw new Error('CORS credentials header missing');
  }

  const registerB = await requestJson('/api/v1/auth/register', {
    method: 'POST',
    body: userB,
    cookieJar: jarB,
  });
  if (registerB.response.status !== 201) {
    throw new Error(`Register B failed: ${registerB.response.status}`);
  }

  const me = await requestJson('/api/v1/auth/me', { cookieJar: jarA });
  if (me.response.status !== 200 || me.json.user.email !== userA.email) {
    throw new Error('Session validation failed after register');
  }

  const unauthorizedSse = await fetch(
    `${API_BASE_URL}/api/v1/work-guides/00000000-0000-4000-8000-000000000000/events`,
    {
      headers: { Origin: FRONTEND_URL },
    },
  );
  if (unauthorizedSse.status !== 401) {
    throw new Error(`Expected unauthorized SSE to return 401, got ${unauthorizedSse.status}`);
  }

  const create = await requestJson('/api/v1/work-guides', {
    method: 'POST',
    body: {
      topic: 'El sistema solar',
      targetAudience: 'Tercero (3o)',
      language: 'es',
      activities: ['WORD_SEARCH - Sopa de letras (DEBES GENERAR EXACTAMENTE 3 ITEMS PARA ESTA ACTIVIDAD)'],
    },
    cookieJar: jarA,
  });

  if (create.response.status !== 202) {
    throw new Error(`Guide creation failed: ${create.response.status}`);
  }

  const guideId = create.json.guideId;
  const ssePromise = waitForSseEvent(guideId, jarA).catch(() => null);
  const completedGuide = await waitForGuideCompletion(guideId, jarA);
  const sseEvent = await ssePromise;

  if (sseEvent && !['COMPLETED', 'FAILED'].includes(sseEvent.status)) {
    throw new Error('Unexpected SSE status payload');
  }

  const history = await requestJson('/api/v1/work-guides', { cookieJar: jarA });
  if (!history.json.some((guide) => guide.id === guideId)) {
    throw new Error('Guide not found in history');
  }

  const review = await requestJson(`/api/v1/work-guides/${guideId}/review`, {
    method: 'POST',
    body: { reviewerName: userA.fullName },
    cookieJar: jarA,
  });
  if (review.response.status !== 200 || review.json.reviewed !== true) {
    throw new Error('Guide review failed');
  }

  const otherUserAccess = await requestJson(`/api/v1/work-guides/${guideId}`, {
    cookieJar: jarB,
  });
  if (otherUserAccess.response.status !== 404) {
    throw new Error(`Expected second user to receive 404, got ${otherUserAccess.response.status}`);
  }

  const logout = await requestJson('/api/v1/auth/logout', {
    method: 'POST',
    cookieJar: jarA,
  });
  if (logout.response.status !== 204) {
    throw new Error('Logout failed');
  }

  const meAfterLogout = await requestJson('/api/v1/auth/me', { cookieJar: jarA });
  if (meAfterLogout.response.status !== 401) {
    throw new Error('Expected /me to fail after logout');
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        apiBaseUrl: API_BASE_URL,
        frontendUrl: FRONTEND_URL,
        guideId,
        completedStatus: completedGuide.status,
        sseReceived: Boolean(sseEvent),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
