# Animora Worker

Background video-processing service for Animora. It consumes transcode commands
from RabbitMQ, turns raw uploads into adaptive-bitrate **HLS** renditions with
FFmpeg, uploads the result to S3-compatible object storage, updates the database,
and emits lifecycle events back to the API.

Unlike the rest of the platform (NestJS), the worker is built with
[**Effect**](https://effect.website) — a single typed `program` composed from
dependency-injected *layers*. There is no HTTP server; the process is a long-lived
RabbitMQ consumer.

## Stack

- **Effect** — dependency injection (layers/services), typed errors, structured concurrency, retries
- **amqplib** — RabbitMQ consumer + publisher
- **@aws-sdk/client-s3** — S3 / MinIO object storage
- **postgres** — direct SQL (no ORM) for status updates
- **FFmpeg** — invoked as a child process (must be on `PATH`)
- **@animora/contracts** — shared queue names, event names, and event payload types
- **tsx** (dev) / **node** (prod), tests run on **bun**

## The HLS processing flow

The worker is one stage in a pipeline that spans the API and the worker. The API
owns the upload and the database; the worker owns transcoding.

```
                 ┌─────────────────────────── apps/api ───────────────────────────┐
  admin uploads  │  CompleteUploadUseCase                                          │
  video chunks   │   • composes chunks → raw/<videoId>/original.mp4 in S3          │
        ──────►  │   • sets video.status = "processing"                           │
                 │   • emits VIDEO_TRANSCODE ───────────┐                          │
                 └──────────────────────────────────────┼──────────────────────────┘
                                                         │ queue: video.transcode
                                                         ▼
                 ┌────────────────────────── apps/worker ──────────────────────────┐
                 │  handleVideoTranscode                                            │
                 │   1. validate event (Effect Schema)                             │
                 │   2. download raw mp4 from S3 → tmp/<videoId>/original.mp4       │
                 │   3. processVideo:                                              │
                 │        • FFmpeg transcode → HLS rendition per quality           │
                 │        • write master.m3u8                                      │
                 │        • upload every .m3u8 / .ts to S3 under p/hls/<videoId>/   │
                 │   4. delete raw mp4, update DB, clean tmp dir                    │
                 │   5. emit VIDEO_TRANSCODED (or VIDEO_TRANSCODE_FAILED) ──┐       │
                 └───────────────────────────────────────────────────────────┼─────┘
                                                         queue: video.events  │
                 ┌──────────────────────────── apps/api ─────────────────────▼─────┐
                 │  VideoEventsConsumer → marks video "ready" / "failed",          │
                 │  notifies clients (SSE)                                         │
                 └──────────────────────────────────────────────────────────────────┘
```

### 1. Command in — `video.transcode`

The API publishes a `VideoTranscodeEvent` to the **`video.transcode`** queue once
an upload is finalized:

```jsonc
{
  "pattern": "video.transcode",
  "data": {
    "videoId": "…",
    "ownerType": "episode" | "trailer",
    "ownerId": "…",
    "rawObjectKey": "raw/<videoId>/original.mp4",
    "qualities": ["360p", "720p", "1080p"]
  }
}
```

Every message on the bus is wrapped in `{ pattern, data }`. The consumer parses
the envelope, the router (`createRouter`) dispatches on `pattern`, and the handler
validates `data` against an Effect `Schema` — an unknown pattern or a malformed
payload is rejected (nacked, not requeued) rather than crashing the worker.

### 2. Download the source

`handleVideoTranscode` creates a scratch directory `tmp/<videoId>/`, streams the
raw object from S3 (`rawObjectKey`) into `tmp/<videoId>/original.mp4`. The `tmp/`
directory is created at startup and is always cleaned up per-job (`Effect.ensuring`),
even on failure.

### 3. Transcode to HLS (`TranscodeService`)

For each requested quality the worker runs one FFmpeg pass that produces a
**VOD HLS** rendition (a `playlist.m3u8` + `segment_###.ts` files):

| Quality | Resolution | Video bitrate | Maxrate / bufsize | Audio | Manifest BANDWIDTH |
|---------|-----------|---------------|-------------------|-------|--------------------|
| 360p    | 640×360   | 800k          | 960k / 1920k      | 128k  | 800 000            |
| 720p    | 1280×720  | 2800k         | 3200k / 6400k     | 128k  | 2 800 000          |
| 1080p   | 1920×1080 | 5000k         | 5500k / 11000k    | 192k  | 5 000 000          |

Encoding details that make the renditions switchable:

- **6-second segments** (`-hls_time 6`, `-hls_playlist_type vod`).
- **Aligned keyframes** across renditions via a fixed GOP (`-g 144`,
  `-keyint_min 144`, `-sc_threshold 0`) and `-force_key_frames` on segment
  boundaries — so a player can switch quality cleanly at any segment.
- `-hls_flags independent_segments`, `libx264 -preset fast`, `yuv420p`, AAC audio.

Output layout in `tmp/<videoId>/`:

```
tmp/<videoId>/
├── original.mp4          # source (excluded from upload, deleted after)
├── master.m3u8           # adaptive manifest, references each rendition
├── 360p/
│   ├── playlist.m3u8
│   └── segment_000.ts …
├── 720p/
│   ├── playlist.m3u8
│   └── segment_000.ts …
└── 1080p/
    ├── playlist.m3u8
    └── segment_000.ts …
```

After the renditions are written, `writeMasterPlaylist` generates `master.m3u8`
with one `#EXT-X-STREAM-INF` entry per quality, pointing at the per-quality
playlists. This is the file players load.

Each quality transcode is retried (exponential backoff, up to 2 retries) before
the whole job is considered failed.

### 4. Upload to S3 (`processVideo`)

`collectOutputFiles` walks the output dir (excluding `original.mp4`) and uploads
every `.m3u8` / `.ts` file to S3 under the prefix **`p/hls/<videoId>/`**, preserving
the relative paths. Uploads run with a concurrency of 10, each with its own
retry policy, and the correct content type is set per file:

- `.m3u8` → `application/vnd.apple.mpegurl`
- `.ts` → `video/mp2t`

The master playlist key returned to the rest of the system is
`p/hls/<videoId>/master.m3u8`.

### 5. Finalize & report back

On **success** the handler:

1. deletes the raw source object from S3,
2. sets `videos.status = 'ready'` and `videos.master_playlist_key` in Postgres,
3. emits **`video.transcoded`** (`VideoTranscodedEvent`) to the **`video.events`** queue,
4. removes the `tmp/<videoId>/` directory.

On **failure** (transcode or upload error) it sets `videos.status = 'failed'` and
emits **`video.transcode_failed`** (`VideoTranscodeFailedEvent`) with a `reason`.
The API's `VideoEventsConsumer` consumes these events to flip the video's UI state
and notify clients.

## Reliability model

- **Concurrency** — `WORKER_CONCURRENCY` controls both the RabbitMQ `prefetch` and
  the number of in-flight jobs. Each job processes its qualities sequentially by
  default; horizontal scaling is achieved by running more worker instances.
- **Acks** — a message is only `ack`ed after the job fully succeeds. Any error is
  logged and the message is `nack`ed **without requeue** (`nack(msg, false, false)`)
  to avoid poison-message loops — the failure is surfaced via the `video.events`
  queue instead.
- **Job timeout** — a single message has up to **6 hours** to complete before it is
  failed.
- **Typed errors** — `TranscodeError`, `S3Error`, `DatabaseError`,
  `InvalidEventError`, `MessageParseError`, `UnknownPatternError` are tagged errors;
  handlers branch on them with `Effect.catchTag`.
- **Crash recovery** — the top-level `program` is retried with exponential backoff
  (up to 30s) so transient infra outages (RabbitMQ/DB/S3) don't kill the process.
  Connections (RabbitMQ, Postgres) are acquired/released as scoped resources.
- **Graceful shutdown** — `SIGINT`/`SIGTERM` interrupt the root fiber, which closes
  the channel, connection, and DB pool via their release finalizers.

## Project layout

```
src/
├── main.ts                 # composes layers, runs program, wires retry + shutdown
├── program.ts              # builds the router and starts the consumer
├── errors/                 # tagged error types
├── infra/
│   ├── config/             # AppConfig — env validated via Effect Schema
│   ├── database/           # SqlClient (postgres), scoped connection
│   ├── ffmpeg/             # FfmpegService — spawns the ffmpeg child process
│   ├── rabbitmq/           # connection/channel, consumer, publisher, router
│   └── s3/                 # S3Client + S3Service (get/put/delete)
└── videos/
    ├── handlers/           # video-transcode.handler — orchestrates one job
    ├── use-cases/          # process-video, update-video-status
    ├── transcode.service.ts# FFmpeg HLS logic + master playlist + file collection
    └── videos.repository.ts# UPDATE videos SET status/master_playlist_key
```

Dependencies are wired in `main.ts` as Effect `Layer`s and provided to `program`.
Services declare their requirements via `Context.Tag`, so swapping a real layer for
a mock (see `test/`) requires no code changes in the business logic.

## Configuration

Copy `.env.example` and fill in the values:

| Variable             | Required | Description                                          |
|----------------------|----------|------------------------------------------------------|
| `RABBITMQ_URL`       | yes      | AMQP connection string                               |
| `DATABASE_URL`       | yes      | Postgres connection string                           |
| `WORKER_CONCURRENCY` | no (1)   | Prefetch + parallel jobs per instance                |
| `S3_ENDPOINT`        | yes      | S3/MinIO endpoint                                    |
| `S3_REGION`          | yes      | S3 region                                            |
| `S3_BUCKET`          | yes      | Bucket holding raw uploads and HLS output            |
| `S3_ACCESS_KEY`      | yes      | Access key                                           |
| `S3_SECRET_KEY`      | yes      | Secret key                                           |

> **Note:** `.env.example` currently only lists `RABBITMQ_URL`, `DATABASE_URL`, and
> `WORKER_CONCURRENCY`, but the worker also requires the `S3_*` variables — config
> validation will fail fast at startup if any are missing.

**FFmpeg must be installed and available on `PATH`.** The worker shells out to the
`ffmpeg` binary directly.

## Running

```bash
# from the repo root — install all workspace deps
bun install

# dev (watch mode)
cd apps/worker && bun run start:dev

# build + run compiled output
cd apps/worker && bun run build && bun run start:prod
```

## Tests

```bash
cd apps/worker

bun run test:unit   # handler logic against mocked layers
bun run test:e2e    # end-to-end flow
```

Tests provide mock implementations of `TranscodeService`, `S3Service`,
`VideosRepository`, and `PublisherService` via Effect layers, so the handler's
success/failure branching can be asserted without touching FFmpeg, S3, or the DB.
