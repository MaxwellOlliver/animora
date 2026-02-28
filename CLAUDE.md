# Animora

Anime streaming platform. Turborepo monorepo with bun workspaces.

## Apps

- `apps/web` — Next.js 16 + React 19 + Tailwind v4 (user-facing)
- `apps/admin` — Next.js 16 + React 19 + Tailwind v4 (admin panel)
- `apps/api` — NestJS 11 REST API
- `apps/worker` — NestJS 11 background worker (RabbitMQ consumer, FFmpeg)

## Packages

- `packages/typescript-config` — shared tsconfig bases
- `packages/eslint-config` — shared ESLint config
- `packages/ui` — shared UI components

## Commands

```bash
bun install                    # install all deps
bun run dev                    # start all apps (turbo)
cd apps/api && bun run start:dev  # start API only
cd apps/api && bun run test       # run API tests
```

## API Architecture (`apps/api`)

See `docs/api-folder-structure.md` for the full spec.

### Stack

- NestJS 11, Passport.js (JWT + Local + Google OAuth), Drizzle ORM + PostgreSQL, class-validator/class-transformer
- Swagger at `/api/docs`

### Structure

```
src/
  modules/<domain>/
    <domain>.module.ts
    <domain>.controller.ts       # HTTP layer — calls use cases, returns responses
    <domain>-admin.controller.ts # Admin routes, guarded by @Roles('ADMIN')
    <domain>.entity.ts           # Drizzle schema definition
    <domain>.repository.ts       # Raw DB queries via Drizzle — no logic
    <domain>.service.ts          # External I/O wrapper (if needed) — no business logic
    use-cases/                   # Business logic — one class per operation, single execute()
    dto/                         # class-validator DTOs
  infra/                         # SDK wrappers (database, minio, rabbitmq)
  common/                        # Guards, decorators, filters, pipes shared across modules
```

### Key Rules

1. **Use cases over fat services** — each operation gets its own use-case class with `execute()`. No multi-method service files for business logic.
2. **Services = dumb wrappers** — services wrap external systems (MinIO, RabbitMQ). No `if` based on domain state. Use cases call services, never the reverse.
3. **Repositories = raw DB only** — no business logic in repositories.
4. **Flat module files** — entity, repository, controller, service live at module root. Only `use-cases/` and `dto/` get folders (they grow).
5. **No cross-module internal imports** — modules communicate through exported services/use-cases only. Never import another module's repositories/entities/use-cases directly.

### Auth

- Stateless JWT access + refresh tokens
- Strategies: local-user (email+password), local-admin (email+password), Google OAuth
- All strategies produce a JWT — downstream code only sees the token + embedded role
- Guards in `common/guards/` — `JwtGuard` (global), `RolesGuard`
- Decorators in `common/decorators/` — `@CurrentUser()`, `@Public()`

### Layer Decision Guide

- Has connection string / API key / SDK import → `infra/`
- NestJS decorator, guard, filter, pipe shared across modules → `common/`
- Business logic or orchestration → `modules/<domain>/use-cases/`
