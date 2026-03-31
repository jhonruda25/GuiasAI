# GuiasAI

<p align="center">
  Plataforma para docentes que genera guias pedagogicas con IA, listas para revisar, reutilizar y exportar.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Frontend-Next.js_16-111827?style=for-the-badge&logo=next.js">
  <img alt="NestJS" src="https://img.shields.io/badge/Backend-NestJS_11-EA2845?style=for-the-badge&logo=nestjs">
  <img alt="Prisma" src="https://img.shields.io/badge/ORM-Prisma_5-2D3748?style=for-the-badge&logo=prisma">
  <img alt="Redis" src="https://img.shields.io/badge/Queue-Redis%20%2B%20BullMQ-DC2626?style=for-the-badge&logo=redis">
  <img alt="Gemini" src="https://img.shields.io/badge/IA-Gemini-2563EB?style=for-the-badge">
</p>

---

## Demo en produccion

- URL demo: [https://guiasai.duckdns.org/](https://guiasai.duckdns.org/)
- Infra: desplegado en CubePath (Dokploy + Docker Compose)

> Si cambias dominio/puerto en CubePath, actualiza este enlace antes de registrar la issue.

## Capturas

### Login

![Login GuiasAI](docs/screenshots/login.png)

### Vista principal

![Workspace GuiasAI](docs/screenshots/workspace.png)

---

## Que hace

GuiasAI permite que un docente configure un tema, grado, idioma y actividades, y reciba una guia completa generada por IA.  
El flujo incluye:

- formulario de generacion
- procesamiento asincrono con cola (worker)
- vista de progreso
- biblioteca de guias por usuario
- preview para revision y exportacion
- portadas visuales por guia con fallback si falla la imagen

## Que problema resuelve

Crear material academico consistente toma mucho tiempo y suele repetirse manualmente.  
GuiasAI reduce ese costo operativo, acelera la preparacion de clase y mantiene un flujo de trabajo claro: generar -> revisar -> reutilizar.

---

## Arquitectura actual

```mermaid
flowchart LR
  U[Docente en navegador] --> F[Frontend Next.js]
  F -->|/api same-origin proxy| B[Backend NestJS]
  B --> P[(PostgreSQL)]
  B --> R[(Redis)]
  B --> Q[BullMQ Queue]
  Q --> W[Worker]
  W --> G[Gemini API]
  W --> P
  B --> F
```

### Componentes obligatorios en produccion

- `frontend`
- `backend`
- `worker`
- `redis`
- `postgres` (interno o externo via `DATABASE_URL`)

Si `worker` no esta corriendo, las guias quedan en `GENERATING`.

---

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS 4
- Backend: NestJS 11, Prisma 5
- Cola: BullMQ + Redis
- DB: PostgreSQL
- IA: Gemini (texto + imagen)
- Monorepo: pnpm + Turbo

---

## Estructura del repo

```txt
apps/
  frontend/   # UI docente
  backend/    # API, auth, colas y worker
packages/
  schemas/    # contrato compartido de guia
deploy/
scripts/
```

---

## Desarrollo local

### 1) Instalar dependencias

```powershell
pnpm.cmd install
```

### 2) Configurar variables

- copiar `apps/backend/.env.example` -> `apps/backend/.env`
- copiar `apps/frontend/.env.local.example` -> `apps/frontend/.env.local`

### 3) Levantar infraestructura local

```powershell
pnpm.cmd db:up
```

### 4) Aplicar migraciones

```powershell
pnpm.cmd db:migrate
```

### 5) Si Prisma se bloquea en Windows

```powershell
pnpm.cmd db:generate:safe
```

### 6) Levantar app en 3 terminales

```powershell
pnpm.cmd dev:api
```

```powershell
pnpm.cmd dev:worker
```

```powershell
pnpm.cmd dev:frontend
```

### 7) Smoke test local

```powershell
pnpm.cmd smoke:test:local
```

---

## Docker local (stack completo)

```powershell
pnpm.cmd compose:local:up
```

Servicios:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`
- postgres: `localhost:5432`
- redis: `localhost:6379`

Apagar:

```powershell
pnpm.cmd compose:local:down
```

---

## Produccion en CubePath / Dokploy

Usar `docker-compose.prod.yml` (o su variante en CubePath) con backend + worker + frontend + redis, y PostgreSQL interno o externo via `DATABASE_URL`.

### Como se uso CubePath en este proyecto

1. Se creo un proyecto en CubePath y se desplego con proveedor `Raw` usando `docker-compose`.
2. Se publicaron imagenes Docker del proyecto y se referenciaron en compose:
   - `chipi7u7/guiasai-frontend:${IMAGE_TAG}`
   - `chipi7u7/guiasai-backend:${IMAGE_TAG}` (backend y worker)
3. Se definieron variables en la pestaña `Environment` de CubePath:
   - `API_BASE_URL`, `FRONTEND_URL`, `DATABASE_URL`, `REDIS_HOST`, `GOOGLE_GENERATIVE_AI_API_KEY`, etc.
4. Se levanto `worker` como servicio dedicado para consumir BullMQ:
   - `command: ["node", "dist/worker.js"]`
5. Se uso red externa `dokploy-network` para integrar servicios y enrutar trafico.
6. El despliegue se verifica con login + creacion de guia + procesamiento en worker.

### Variables minimas recomendadas

```env
FRONTEND_URL=https://app.tudominio.com
API_BASE_URL=https://api.tudominio.com
NEXT_PUBLIC_API_URL=
SESSION_COOKIE_DOMAIN=
DATABASE_URL=postgresql://guiasai:password-fuerte@postgres:5432/guiasai
GOOGLE_GENERATIVE_AI_API_KEY=replace-me
SEED_DEMO_USER=false
```

### Migraciones (obligatorio antes de trafico)

```powershell
docker compose -f docker-compose.prod.yml --profile ops run --rm migrate
```

### Build minimo recomendado

```powershell
pnpm.cmd --filter backend build
pnpm.cmd --filter frontend build
```

---

## Errores comunes y causa real

- `P2022 ... work_guides.has_cover does not exist`:
  - codigo nuevo desplegado sin migracion aplicada.
- `Failed to proxy http://localhost:3001/...` en frontend:
  - `API_BASE_URL` mal configurada o imagen vieja en deploy.
- login falla entre subdominios `duckdns.org`:
  - no usar `SESSION_COOKIE_DOMAIN=.duckdns.org` (PSL).

---

## Seguridad

- no versionar `.env*` reales
- `SEED_DEMO_USER=true` solo en ambientes no productivos
- no exponer API keys en README, commits o issues

---

## Comandos utiles

```powershell
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd build
pnpm.cmd prisma:validate
pnpm.cmd compose:prod:config
```
