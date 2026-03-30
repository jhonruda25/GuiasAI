FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack --version && corepack enable

FROM base AS builder
# Agregar libc6-compat necesario para binarios como SWC/Turborepo
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
# Prune para extraer solo lo necesario del frontend
RUN turbo prune frontend --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/out/json/ .
# Instalar dependencias usando --no-frozen-lockfile para evitar errores de mismatch
RUN pnpm install --no-frozen-lockfile

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
ENV NODE_ENV=production
# Compilar frontend (Next.js creara la carpeta standalone optimizada)
RUN pnpm turbo run build --filter=frontend

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Instalar parches de seguridad alpine sin redundancias dev
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat

# OWASP: Eliminar binarios globales de gestores de paquetes para reducir footprint
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg /usr/local/bin/corepack

# Configurar usuario no root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copiar artefactos optimizados del build standalone
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ejecutar el servidor standalone directamente
CMD ["node", "apps/frontend/server.js"]
