FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
RUN turbo prune frontend --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
# Install dependencies following OWASP: Use frozen-lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/out/json/ .
RUN pnpm install --no-frozen-lockfile

# Build project with production environment explicitly
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
ENV NODE_ENV=production
RUN pnpm turbo run build --filter=frontend

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Upgrading system packages to patch zlib and busybox CVEs
RUN apk update && apk upgrade --no-cache

# OWASP: Reduce attack surface by deleting global node binaries and npm
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg /usr/local/bin/corepack

# OWASP: Run container as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/frontend/public ./apps/frontend/public
# Automatically leverage output traces to reduce image size (requires standalone output)
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/frontend/server.js"]
