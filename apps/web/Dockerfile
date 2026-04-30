# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.10-alpine AS pruner
WORKDIR /app
COPY . .
RUN bunx --bun turbo@2.8.12 prune web --docker

FROM oven/bun:1.3.10-alpine AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN bun install

COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_S3_ENDPOINT
ARG NEXT_PUBLIC_SIGNUP_ENABLED
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_S3_ENDPOINT=$NEXT_PUBLIC_S3_ENDPOINT
ENV NEXT_PUBLIC_SIGNUP_ENABLED=$NEXT_PUBLIC_SIGNUP_ENABLED

# Server-side env placeholders — only consumed at build time so zod schema
# validates. Real values come from docker-compose env at runtime.
ENV APP_URL=https://build.placeholder
ENV API_URL=https://build.placeholder/api
ENV SESSION_SECRET=build-time-placeholder

RUN bunx --bun turbo@2.8.12 run build --filter=web

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache tini

COPY --from=installer /app/apps/web/.next/standalone ./
COPY --from=installer /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/web/server.js"]
