FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
RUN turbo prune backend --docker

FROM base AS installer
# OWASP: Use Alpine Linux base. Prisma requires openssl.
RUN apk update && apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/out/json/ .
RUN pnpm install --no-frozen-lockfile

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
# Generate prisma client before building
RUN pnpm --filter backend exec prisma generate
ENV NODE_ENV=production
RUN pnpm turbo run build --filter=backend

# Optimización radical: Eliminamos las devDependencies para la imagen final
RUN CI=true pnpm prune --prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk update && apk upgrade --no-cache && apk add --no-cache openssl

# OWASP: Reduce attack surface by deleting global node binaries and npm (fixes tar, minimatch, glob CVEs)
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg /usr/local/bin/corepack

# OWASP: Execute application as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy over exact needed files to reduce attack surface and size
COPY --from=installer --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/backend/prisma ./apps/backend/prisma

USER nestjs

EXPOSE 3001
ENV PORT=3001
CMD ["node", "apps/backend/dist/main"]
