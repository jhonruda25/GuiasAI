# GuiasAI

GuiasAI es un monorepo con:

- `apps/frontend`: Next.js 16 para la interfaz docente
- `apps/backend`: NestJS + BullMQ para API, auth y procesamiento
- `packages/schemas`: contrato compartido de la guia pedagogica

## Arquitectura de produccion

- Frontend en Vercel
- API Nest en Railway
- Worker BullMQ en Railway
- PostgreSQL gestionado en Railway
- Redis gestionado en Railway

Para produccion conviene usar dominios del mismo sitio, por ejemplo:

- `app.tudominio.com` para frontend
- `api.tudominio.com` para backend

De esa forma la cookie de sesion puede vivir bajo `SESSION_COOKIE_DOMAIN=.tudominio.com`.

## Variables importantes

### Backend

- `FRONTEND_URL`
- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `SESSION_COOKIE_DOMAIN`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `SENTRY_DSN`

### Frontend

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN` opcional si quieres separar el DSN del runtime server/edge

## Levantar en local

1. Instala dependencias:

```powershell
pnpm.cmd install
```

2. Crea variables de entorno:

- copia `apps/backend/.env.example` a `apps/backend/.env`
- copia `apps/frontend/.env.local.example` a `apps/frontend/.env.local`

3. Levanta PostgreSQL y Redis:

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

Ese script puede cerrar procesos `node.exe` del workspace para liberar el engine bloqueado de Prisma.

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

7. Ejecuta el smoke test local cuando los servicios esten arriba:

```powershell
pnpm.cmd smoke:test:local
```

## Checklist de despliegue

### Frontend en Vercel

- Configura `NEXT_PUBLIC_API_URL=https://api.tudominio.com`
- Configura `NEXT_PUBLIC_SENTRY_DSN`
- Configura `SENTRY_DSN` si quieres telemetria tambien en runtime server/edge
- Usa [vercel.json](/C:/Users/JHONR2/Desktop/TODO/PROYECTOS%20PERSONALES/GuiasAI/vercel.json) como base
- Puedes partir de [frontend.env.production.example](/C:/Users/JHONR2/Desktop/TODO/PROYECTOS%20PERSONALES/GuiasAI/deploy/vercel/frontend.env.production.example)
- Verifica que `/login`, `/register` y `/` construyan correctamente

### API en Railway

- Usa [api.json](/C:/Users/JHONR2/Desktop/TODO/PROYECTOS%20PERSONALES/GuiasAI/deploy/railway/api.json) como referencia
- Puedes partir de [api.env.production.example](/C:/Users/JHONR2/Desktop/TODO/PROYECTOS%20PERSONALES/GuiasAI/deploy/railway/api.env.production.example)
- Configura:
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://app.tudominio.com`
  - `SESSION_COOKIE_DOMAIN=.tudominio.com`
  - `DATABASE_URL`
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_PASSWORD` si aplica
  - `GOOGLE_GENERATIVE_AI_API_KEY`
  - `SENTRY_DSN`
- Ejecuta migraciones al desplegar:

```powershell
pnpm.cmd --filter backend exec prisma migrate deploy
```

### Worker en Railway

- Usa [worker.json](/C:/Users/JHONR2/Desktop/TODO/PROYECTOS%20PERSONALES/GuiasAI/deploy/railway/worker.json) como referencia
- Puedes partir de [worker.env.production.example](/C:/Users/JHONR2/Desktop/TODO/PROYECTOS%20PERSONALES/GuiasAI/deploy/railway/worker.env.production.example)
- Reutiliza las mismas variables del backend
- Verifica conectividad a Redis y base de datos

## Seguridad antes de publicar

- Rota cualquier `GOOGLE_GENERATIVE_AI_API_KEY` o secreto real que haya vivido en archivos `.env` locales o commits.
- Revisa que `FRONTEND_URL`, `NEXT_PUBLIC_API_URL` y `SESSION_COOKIE_DOMAIN` apunten a tus dominios finales.
- Manten `Secure` cookies habilitadas en produccion y confirma el flujo login/logout en staging antes de abrir acceso publico.

## Comandos utiles

```powershell
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd build
pnpm.cmd prisma:validate
```
