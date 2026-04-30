# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.10-alpine AS pruner
WORKDIR /app
COPY . .
RUN bunx --bun turbo@2.8.12 prune api --docker

FROM oven/bun:1.3.10-alpine AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN bun install

COPY --from=pruner /app/out/full/ .
RUN bunx --bun turbo@2.8.12 run build --filter=api

FROM oven/bun:1.3.10-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache tini

COPY --from=installer /app .

WORKDIR /app/apps/api
EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bun", "run", "dist/main.js"]
