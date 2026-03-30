# GuiasAI Agent Notes

Usa este archivo cuando trabajes en este repo. Prioriza hechos del proyecto sobre supuestos genéricos.

## Arquitectura crítica

- El `backend` crea sesiones y encola generación de guías.
- El `worker` consume BullMQ y ejecuta la generación real.
- Si la guía queda en `GENERATING`, revisa primero si existe y corre el servicio `worker`.
- El frontend usa proxy same-origin para `/api/*`.
- No dependas de `NEXT_PUBLIC_API_URL` para auth por cookie.
- `API_BASE_URL` debe existir como variable runtime del contenedor frontend.
- En despliegues con `duckdns.org`, no dependas de `SESSION_COOKIE_DOMAIN=.duckdns.org`.

## Auth y despliegue

- El navegador debe llamar a rutas relativas como `/api/v1/auth/login`.
- `NEXT_PUBLIC_API_URL` debe quedar vacío en producción si se usa proxy same-origin.
- `SESSION_COOKIE_DOMAIN` debe quedar vacío con este esquema.
- Si aparece `Failed to proxy http://localhost:3001/...`, el frontend está resolviendo mal `API_BASE_URL` o sigue desplegada una imagen vieja.

## Docker Compose mínimo en producción

El stack debe incluir:

- `frontend`
- `backend`
- `worker`
- `redis`

El `worker` usa la misma imagen del backend con:

```yaml
command: ["node", "dist/worker.js"]
```

## Flujo de depuración recomendado

### Login

1. Confirmar que el navegador llama a `/api/v1/auth/login`.
2. Si falla con `500`, revisar logs del frontend por errores de proxy.
3. Si el backend crea sesión pero el usuario sigue en `/login`, revisar cookie same-origin y middleware.

### Generación de guías

1. Revisar logs del `backend`:
   - creación de guía
   - cambio a `GENERATING`
   - enqueue BullMQ
2. Revisar logs del `worker`:
   - `Work guide worker is running`
   - `Processing job ...`
   - `completed successfully`
   - o `Failed to generate ...`
3. Si no hay logs del `worker`, el problema no es la IA: es despliegue o cola no consumida.

## Problemas conocidos del modelo

Gemini puede devolver shapes inválidos aunque `generateObject` pida schema. Patrones ya observados:

- `activity_type` en vez de `type`
- `instruction` en vez de `instructions`
- `score_per_item` en vez de `score`
- `TRUE_FALSE` como strings, arrays alternados o pares `statement:` / `is_true:`
- `MATCH_CONCEPTS` como strings planos o pares `concept:` / `definition:`
- `WORD_SEARCH` y `CROSSWORD` como strings planos o pares `word:` / `clue_or_definition:`
- `MULTIPLE_CHOICE` como strings `question:` / `options:` / `correct_answer:`
- `WORD_SCRAMBLE` como `string[]`

Cuando toques `apps/backend/src/infrastructure/ai/vercel-ai-generator.service.ts`, conserva:

- endurecimiento del prompt
- normalización local de shapes legacy
- intento de reparación estructurada

## Validación mínima antes de cerrar cambios

Ejecuta lo que aplique:

```powershell
pnpm.cmd --filter backend build
pnpm.cmd --filter frontend build
```

Si el cambio afecta despliegue o auth, indica explícitamente:

- variables requeridas
- servicios obligatorios en compose
- qué contenedor debe mostrar logs esperados

## Criterio de trabajo

- No atribuyas a “bug de IA” lo que puede ser un problema de compose, worker o proxy.
- No propongas cambios de env sin verificar primero si la variable se lee en build-time o runtime.
- Cuando un log contradiga una hipótesis, abandona la hipótesis.
