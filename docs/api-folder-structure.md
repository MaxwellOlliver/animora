# Animora — Architecture & Project Structure

This document describes the architectural decisions and folder structure for the Animora API. It is intended to guide code generation and enforce consistency across the codebase.

---

## Stack

- **Framework**: NestJS
- **Queue**: RabbitMQ via `@nestjs/microservices`
- **Storage**: MinIO (S3-compatible)
- **ORM**: Drizzle ORM + PostgreSQL
- **Auth**: Passport.js (JWT, Google OAuth, Local)
- **HTTP**: Fastify via `@nestjs/platform-fastify`
- **Monorepo**: Turborepo + bun workspaces

---

## Core Architectural Principles

### 1. Use Cases over Fat Services

Each operation has a dedicated use case class with a single `execute()` method. Use cases contain all orchestration and business logic. There are no fat service files handling multiple operations.

```typescript
@Injectable()
export class CreateAnimeUseCase {
  constructor(private readonly animeRepository: AnimeRepository) {}

  async execute(dto: CreateAnimeDto): Promise<Anime> {
    // all creation logic lives here
  }
}
```

### 2. Services for External Interaction Only

Services are dumb wrappers around external systems (MinIO, RabbitMQ, HTTP APIs). They make no business decisions — no `if` statements based on domain state. Use cases call services; services never call use cases.

```typescript
// ✅ correct — service is a dumb wrapper
@Injectable()
export class StorageService {
  async composeChunks(uploadId: string): Promise<void> {
    await this.minioService.composeObject(...);
  }
}

// ✅ correct — use case orchestrates
export class CompleteUploadUseCase {
  async execute(uploadId: string) {
    await this.storageService.composeChunks(uploadId);
    await this.uploadRepository.updateStatus(uploadId, 'processing');
    await this.messagingService.publish('video.uploaded', { uploadId });
  }
}
```

### 3. Repositories for Database Access Only

Repositories handle raw database queries. They contain no business logic — just reads and writes. All logic lives in use cases.

### 4. Flat Module Files, Folders Only Where They Grow

Entity, repository, and controller files live at the module root — no wrapper folders for single files. Only `use-cases/` and `dto/` get their own folders since they accumulate multiple files. Admin routes use a separate controller file at the module root (e.g. `anime-admin.controller.ts`) guarded by `@Roles('ADMIN')`.

### 5. Modules Never Cross-Import Internals

Modules communicate only through their exported services or use cases. A module must never import from another module's `repositories/`, `entities/`, or `use-cases/` directly. It imports the module and uses what is exported.

---

## Layer Responsibilities

| Layer      | Lives In                   | Responsibility                                                         |
| ---------- | -------------------------- | ---------------------------------------------------------------------- |
| Controller | `modules/*/*.controller.ts`| Receives HTTP request, calls use case, returns response                |
| Use Case   | `modules/*/use-cases/`     | Orchestrates business logic for one operation                          |
| Service    | `modules/*/*.service.ts`   | Wraps external I/O (storage, messaging) with domain-meaningful methods |
| Repository | `modules/*/*.repository.ts`| Raw database queries, no logic                                         |
| Entity     | `modules/*/*.entity.ts`    | Drizzle schema definitions                                             |
| Infra      | `infra/`                   | Raw SDK wrappers (MinIO, RabbitMQ, HTTP)                               |
| Common     | `common/`                  | NestJS cross-cutting concerns (guards, filters, pipes, decorators)     |

---

## Folder Structure

```
src/
  modules/
    anime/
      anime.module.ts
      anime.controller.ts             ← user-facing routes (read-only)
      anime-admin.controller.ts       ← admin routes (CRUD, publish)
      anime.entity.ts
      anime.repository.ts
      use-cases/
        create-anime.use-case.ts
        update-anime.use-case.ts
        delete-anime.use-case.ts
        publish-anime.use-case.ts
        search-anime.use-case.ts
        get-anime.use-case.ts
      dto/
        create-anime.dto.ts
        update-anime.dto.ts
        query-anime.dto.ts

    episode/
      episode.module.ts
      episode.controller.ts
      episode-admin.controller.ts
      episode.entity.ts
      episode.repository.ts
      use-cases/
        create-episode.use-case.ts
        update-episode.use-case.ts
        delete-episode.use-case.ts
        publish-episode.use-case.ts
        get-episode.use-case.ts
      dto/

    upload/
      upload.module.ts
      upload.controller.ts
      upload.entity.ts
      upload.repository.ts
      storage.service.ts              ← wraps MinioService with upload-specific methods
      messaging.service.ts            ← wraps RabbitmqService, publishes video.uploaded
      use-cases/
        init-upload.use-case.ts
        upload-chunk.use-case.ts
        complete-upload.use-case.ts
      dto/

    streaming/
      streaming.module.ts
      streaming.controller.ts
      storage.service.ts              ← generates presigned MinIO URLs
      use-cases/
        get-stream-url.use-case.ts
        get-subtitles.use-case.ts
      dto/

    auth/
      auth.module.ts
      auth.controller.ts
      refresh-token.entity.ts
      refresh-token.repository.ts
      strategies/
        google.strategy.ts
        local.strategy.ts
        jwt.strategy.ts
        jwt-refresh.strategy.ts
      guards/
        local-auth.guard.ts
        google-auth.guard.ts
        jwt-refresh.guard.ts
      use-cases/
        login.use-case.ts
        google-auth.use-case.ts
        refresh-token.use-case.ts
        logout.use-case.ts
      dto/

    users/
      users.module.ts
      users.controller.ts
      user.entity.ts
      users.repository.ts
      use-cases/
        create-user.use-case.ts
        update-user.use-case.ts
        get-user.use-case.ts
      dto/

    admin/
      avatars/
        avatar.entity.ts

  infra/
    database/
      database.module.ts              ← Drizzle ORM connection and config

    minio/
      minio.module.ts
      minio.service.ts                ← raw MinIO SDK: putObject, getObject, composeObject

    rabbitmq/
      rabbitmq.module.ts
      rabbitmq.service.ts             ← raw publish/consume wrappers

    mail/                             ← if email is added (welcome, password reset)
      mail.module.ts
      mail.service.ts

    http/                             ← if external APIs are consumed (e.g. AniList metadata)
      http.module.ts
      http.service.ts

  common/
    decorators/
      current-user.decorator.ts       ← @CurrentUser() param decorator
      public.decorator.ts             ← @Public() to skip JWT guard

    filters/
      http-exception.filter.ts        ← global error response shaping

    interceptors/
      logging.interceptor.ts
      transform.interceptor.ts        ← wraps all responses in { data, status }

    pipes/
      validation.pipe.ts              ← global DTO validation via class-validator

    guards/
      jwt.guard.ts
      roles.guard.ts

  app.module.ts
  main.ts
```

---

## Infra vs Common

Use this rule to decide where something belongs:

- Does it have a connection string, an API key, or an SDK import? → `infra/`
- Is it a NestJS decorator, guard, filter, or pipe shared across modules? → `common/`
- Does it contain business logic or orchestration? → `modules/`

Nothing in `infra/` contains business logic. Nothing in `common/` makes a network call. If `infra/` were replaced with mocks, all business logic should remain fully testable.

---

## Auth Strategy

There are three Passport strategies registered in `AuthModule`:

| Strategy                  | Used By | Method            |
| ------------------------- | ------- | ----------------- |
| `google.strategy.ts`      | Users   | OAuth2 via Google |
| `local-user.strategy.ts`  | Users   | Email + password  |
| `local-admin.strategy.ts` | Admins  | Email + password  |

All three produce a JWT on success. The rest of the application only sees the token and the role embedded in it — it never knows which strategy was used.

Admin login is protected with rate limiting via `@nestjs/throttler` to prevent brute force attacks.

---

## RabbitMQ Events

| Event             | Published By          | Consumed By                      |
| ----------------- | --------------------- | -------------------------------- |
| `video.uploaded`  | `upload` module (API) | Worker                           |
| `video.processed` | Worker                | Notification service / WebSocket |

Event payload contracts are defined in the `packages/shared` workspace package and imported by both the API and the Worker to ensure type safety across services.

---

## What Lives in the Worker

The Worker is a separate NestJS application in `apps/worker/`. It has no HTTP controllers. It only consumes RabbitMQ messages, runs FFmpeg, and writes to MinIO.

See `animora-video-pipeline.md` for the full Worker structure and processing flow.
