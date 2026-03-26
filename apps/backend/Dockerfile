FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack --version && corepack enable

FROM base AS builder
# Agregar dependencias nativas para construir el entorno
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
# Extraer solo el workspace del backend
RUN turbo prune backend --docker

FROM base AS installer
# Prisma requiere openssl para funcionar
RUN apk update && apk add --no-cache libc6-compat openssl
WORKDIR /app

# Primero copiar solo el lockfile y package.jsons
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/out/json/ .
# Instalar respetando versiones exactas permitiendo actualizar el lockfile internamente
RUN pnpm install --frozen-lockfile

# Copiar el código fuente y herramientas de compilación
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Prisma generate ANTES de buildear el backend
RUN pnpm --filter backend exec prisma generate
ENV NODE_ENV=production
# Construir NestJS Backend a dist/
RUN pnpm turbo run build --filter=backend

# Compilar script de seed a un solo archivo JS para evitar ts-node en prod
RUN npx esbuild apps/backend/prisma/seed.ts --bundle --platform=node --format=cjs --external:@prisma/client --external:bcryptjs --outfile=apps/backend/prisma/seed.js

# Realizar deploy aislado de turborepo excluyendo devDependencies
RUN pnpm deploy --filter backend --prod --legacy /app/pruned

# Generar nuevamente el cliente de Prisma DENTRO del entorno podado de producción
WORKDIR /app/pruned
RUN npx prisma generate --schema=prisma/schema.prisma

FROM base AS runner
WORKDIR /app/apps/backend
ENV NODE_ENV=production
RUN apk update && apk upgrade --no-cache && apk add --no-cache openssl

# OWASP Limpieza
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg /usr/local/bin/corepack

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Extraer el build aislado del installer asegurando que 'dist' existe sin anidarlo defectuosamente
COPY --from=installer --chown=nestjs:nodejs /app/pruned ./

# Nota: EL SEGUNDO COPY SE HA ELIMINADO para evitar anidación perjudicial de "./dist/dist"

EXPOSE 3001
ENV PORT=3001

# Ejecutar el migrador, seed y correr NestJS directamente desde el entrypoint estático
CMD ["node", "dist/main.js"]
