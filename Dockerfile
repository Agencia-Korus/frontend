# ============================================================
# Korus Frontend — Next.js (standalone) multi-stage Dockerfile
# Otimizado para deploy via EasyPanel.
#
# Atenção: variáveis NEXT_PUBLIC_* são embutidas no bundle em
# BUILD TIME. No EasyPanel, defina-as como "Build Args" (não só
# como env de runtime), senão o front sobe sem as URLs corretas.
# ============================================================

# Mantenha a versão de Node atualizada para a LTS vigente.
ARG NODE_VERSION=22-slim

# ------------------------------------------------------------
# Stage 1: deps — instala node_modules com cache de store
# ------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Habilita o pnpm na versão fixada em package.json ("packageManager")
RUN corepack enable

# Copia apenas os manifests primeiro para aproveitar o cache de camadas
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ------------------------------------------------------------
# Stage 2: builder — gera o build standalone do Next.js
# ------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- Variáveis públicas (embutidas no bundle em build time) ---
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_BUCKET=korus-assets
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
ARG NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:8001

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_BUCKET=${NEXT_PUBLIC_SUPABASE_BUCKET}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_AUTH_BASE_URL=${NEXT_PUBLIC_AUTH_BASE_URL}

# Cacheia o diretório .next/cache entre builds para acelerar rebuilds
RUN --mount=type=cache,target=/app/.next/cache \
    pnpm build

# ------------------------------------------------------------
# Stage 3: runner — imagem final mínima
# ------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copia os assets de runtime (o output standalone já traz o necessário)
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
