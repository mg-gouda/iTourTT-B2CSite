# B2C standalone backend (NestJS). Listens :3002, serves /api + /uploads.
# Prisma 7 (generator provider "prisma-client" → ../generated/prisma;
# datasource URL comes from prisma.config.ts → process.env.DATABASE_URL).
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# fall back to npm install so cross-platform optional deps resolve on alpine
RUN npm ci || npm install
COPY . .
RUN npx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
# node_modules kept so `npx prisma db push` runs at deploy time
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package*.json ./
# uploaded website media — persisted via the compose `b2c-uploads` volume
RUN mkdir -p uploads
EXPOSE 3002
# nest-cli preserves src/ layout (root-level files present) → entry is dist/src/main.js
CMD ["node", "dist/src/main.js"]
