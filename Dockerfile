# ── Build stage ──
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# npm ci is strict about the lockfile; fall back to npm install so cross-platform
# optional deps (e.g. @emnapi musl variants) resolve on alpine.
RUN npm ci || npm install

COPY . .

# Backend API base URL. Needed at BUILD time so it is baked into the client
# bundle (the browser calls the absolute backend URL cross-origin).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# ── Production stage ──
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Bind to all interfaces so the container is reachable from the host/proxy.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Also needed at RUNTIME for SSR (site-settings fetch in the root layout).
# Baked as a default; overridable via `docker run -e` / compose `environment`.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy standalone Next.js output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
