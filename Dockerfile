# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY prisma ./prisma
RUN npm run prisma:generate
COPY nest-cli.json tsconfig*.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
RUN groupadd --system nestjs \
  && useradd --system --gid nestjs --home /app nestjs \
  && chown -R nestjs:nestjs /app
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
