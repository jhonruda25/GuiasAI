# GuiasAI

GuiasAI es un monorepo con:

- `apps/frontend`: Next.js 16 para la interfaz docente
- `apps/backend`: NestJS + BullMQ para API, auth y procesamiento
- `packages/schemas`: contrato compartido de la guia pedagogica

## Arquitectura objetivo

Produccion en Dokploy con un stack completo basado en Docker Compose:

- `frontend`
- `backend`
- `worker`
- `postgres`
- `redis`

Dokploy maneja dominio y HTTPS. La recomendacion es usar:

- `app.tudominio.com` para frontend
- `api.tudominio.com` para backend

Con eso la sesion puede usar:

- `FRONTEND_URL=https://app.tudominio.com`
- `NEXT_PUBLIC_API_URL=https://api.tudominio.com`
- `API_BASE_URL=https://api.tudominio.com`
- `SESSION_COOKIE_DOMAIN=.tudominio.com`

## Variables importantes

### Backend

- `FRONTEND_URL`
- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `SESSION_COOKIE_DOMAIN`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `SENTRY_DSN` opcional
- `SEED_DEMO_USER=false` en produccion

### Frontend

- `API_BASE_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN` opcional

## Desarrollo local

### Opcion 1: desarrollo por procesos

1. Instala dependencias:

```powershell
pnpm.cmd install
```

2. Crea variables de entorno:

- copia `apps/backend/.env.example` a `apps/backend/.env`
- copia `apps/frontend/.env.local.example` a `apps/frontend/.env.local`

3. Levanta solo PostgreSQL y Redis:

```powershell
pnpm.cmd db:up
```

4. Aplica migraciones:

```powershell
pnpm.cmd db:migrate
```

5. Si Prisma queda bloqueado por Windows:

```powershell
pnpm.cmd db:generate:safe
```

6. Inicia los tres procesos en terminales separadas:

```powershell
pnpm.cmd dev:api
```

```powershell
pnpm.cmd dev:worker
```

```powershell
pnpm.cmd dev:frontend
```

7. Ejecuta el smoke test local:

```powershell
pnpm.cmd smoke:test:local
```

### Opcion 2: stack local completo con Docker

```powershell
pnpm.cmd compose:local:up
```

Servicios expuestos:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`
- postgres: `localhost:5432`
- redis: `localhost:6379`

Para correr el smoke test contra el stack Docker local:

```powershell
$env:API_BASE_URL='http://localhost:3001'; $env:FRONTEND_URL='http://localhost:3000'; pnpm.cmd smoke:test:local
```

Para bajar el stack:

```powershell
pnpm.cmd compose:local:down
```

## Produccion con Dokploy

Usa `docker-compose.prod.yml` como stack principal. Incluye:

- frontend publico
- backend publico
- worker interno
- postgres interno con volumen persistente
- redis interno con volumen persistente

### Variables minimas recomendadas

```env
# copia este bloque como base a .env.production
FRONTEND_URL=https://app.tudominio.com
API_BASE_URL=https://api.tudominio.com
NEXT_PUBLIC_API_URL=https://api.tudominio.com
SESSION_COOKIE_DOMAIN=.tudominio.com
DATABASE_URL=postgresql://guiasai:password-fuerte@postgres:5432/guiasai
GOOGLE_GENERATIVE_AI_API_KEY=replace-me
SEED_DEMO_USER=false
```

Tambien puedes partir del archivo versionado `.env.production.example`.

### Migraciones

El backend ya no ejecuta migraciones ni seed al arrancar. Ejecuta las migraciones como tarea separada:

```powershell
docker compose -f docker-compose.prod.yml --profile ops run --rm migrate
```

Si necesitas crear el usuario demo en un ambiente no productivo:

```powershell
$env:SEED_DEMO_USER='true'; pnpm.cmd --filter backend db:seed
```

No habilites `SEED_DEMO_USER` en produccion.

### Checklist de despliegue

- configura `FRONTEND_URL`, `API_BASE_URL`, `NEXT_PUBLIC_API_URL` y `SESSION_COOKIE_DOMAIN` con tus dominios finales
- ejecuta la tarea `migrate` antes de publicar trafico
- publica `frontend` en `app.<dominio>` y `backend` en `api.<dominio>`
- verifica `GET /healthz` y `GET /readyz` en backend
- confirma que `worker` procese una guia de prueba hasta `COMPLETED`
- verifica login, logout, registro y acceso al historial

## Seguridad

- la aplicacion mantiene registro publico en `/register`
- no existe bypass de login en frontend
- la cuenta demo solo puede sembrarse con `SEED_DEMO_USER=true`
- ignora siempre archivos `.env*` fuera de los ejemplos versionados

## Comandos utiles

```powershell
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd build
pnpm.cmd prisma:validate
pnpm.cmd compose:prod:config
```
