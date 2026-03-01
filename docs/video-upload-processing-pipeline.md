# Animora — Video Upload & Processing Pipeline

## Overview

The video pipeline is divided into two independent phases: **upload** and **processing**. The API handles the upload, hands off the job to RabbitMQ, and immediately returns to the client. The Worker picks up the job asynchronously, transcodes the video, and stores the result in MinIO.

At no point does the API wait for transcoding to complete.

```
Client → API (chunked upload) → MinIO (raw file)
                              → RabbitMQ (job published)
                                         ↓
                                      Worker
                                         ↓
                              FFmpeg (HLS transcoding)
                                         ↓
                              MinIO (HLS segments stored)
                                         ↓
                              Database (video status updated)
                                         ↓
                              Client notified (WebSocket / polling)
```

---

## Phase 1: Chunked Upload (Client → API)

### Why Chunked?

Uploading a large video file (1–10GB) in a single HTTP request is unreliable and memory-intensive. The client splits the file into fixed-size chunks (5MB each) and sends them one by one. The API stores each chunk as a temporary object in MinIO without buffering the full file in memory.

### Step 1 — Initialize Upload

The client requests a new upload session before sending any data.

**Request**

```
POST /uploads/init
Content-Type: application/json

{
  "filename": "episode-01.mp4",
  "fileSize": 2147483648,
  "totalChunks": 410,
  "mimeType": "video/mp4",
  "videoId": "uuid"
}
```

**Response**

```json
{
  "uploadId": "uuid",
  "chunkSize": 5242880
}
```

The API creates an upload record in the database with status `pending` and returns the `uploadId` the client will reference for all subsequent requests.

---

### Step 2 — Upload Chunks

The client slices the file using the browser `File.slice()` API and sends each chunk as `multipart/form-data`. The `File` object is a lazy reference to disk — `.slice()` reads only the requested bytes into memory, so the browser holds at most one chunk (5MB) at any time regardless of file size.

**Request**

```
POST /uploads/:uploadId/chunk/:index
Content-Type: multipart/form-data

chunk: <binary blob>
```

**Response**

```json
{
  "index": 0,
  "received": true
}
```

Also, the client must save on localStorage the upload id alongside with the file fingerprint in order to resume a failed upload.

Fingerprint suggestion:

```ts
async function fingerprintFile(file) {
  const slices = [
    file.slice(0, 64 * 1024), // first 64KB
    file.slice(
      Math.floor(file.size / 2),
      Math.floor(file.size / 2) + 64 * 1024,
    ), // middle 64KB
    file.slice(-64 * 1024), // last 64KB
  ];

  const buffers = await Promise.all(slices.map((s) => s.arrayBuffer()));
  const combined = new Uint8Array(
    buffers.reduce((acc, b) => acc + b.byteLength, 0),
  );

  let offset = 0;
  for (const buf of buffers) {
    combined.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  const hash = await crypto.subtle.digest("SHA-256", combined);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

It generates a hash with the first 64 bytes, middle 64 bytes, and last 64 bytes of the file. This is a fast way to create a unique fingerprint without reading the entire file.

The API streams each chunk directly to MinIO using a `PassThrough` stream, bypassing memory entirely:

```
Network → [Request Stream] → PassThrough → MinIO SDK → MinIO Bucket
```

Each chunk is stored at:

```
temp/{uploadId}/chunk-{index}
```

The API marks each chunk as received in the database. If a chunk fails, the client retries only that chunk.

---

### Step 3 — Complete Upload

Once all chunks are uploaded, the client signals completion.

**Request**

```
POST /uploads/:uploadId/complete
```

The API performs the following in sequence:

1. Verifies all expected chunks are present in MinIO
2. Uses MinIO's **compose object** operation to merge all chunks into a single file:
   ```
   raw/{videoId}/original.mp4
   ```
3. Deletes all temporary chunk objects from MinIO
4. Updates the upload status to `processing` in the database
5. Publishes a `video.uploaded` event to RabbitMQ
6. Returns immediately to the client

**Response**

```json
{
  "videoId": "uuid",
  "status": "processing"
}
```

The client can now poll `GET /videos/:videoId/status` or listen on a WebSocket for the processing result.

---

### Chunk Upload — Client-Side Flow

```
file = <user selected File>
totalChunks = Math.ceil(file.size / CHUNK_SIZE)

POST /uploads/init → uploadId

for each chunk index (0 to totalChunks - 1):
  blob = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
  POST /uploads/:uploadId/chunk/:index  ← only 5MB in memory at a time

POST /uploads/:uploadId/complete
```

Chunks can be uploaded in parallel (recommended concurrency: 3) to improve throughput while keeping memory usage at `concurrency × chunkSize` (≈15MB).

---

## Phase 2: Video Processing (Worker)

The Worker is a separate NestJS application. It has no HTTP endpoints — it only listens to RabbitMQ. It is the sole service responsible for FFmpeg and MinIO write operations on processed content.

### RabbitMQ Message — `video.uploaded`

```json
{
  "videoId": "uuid",
  "uploadId": "uuid",
  "rawObjectPath": "raw/uuid/original.mp4",
  "qualities": ["360p", "720p", "1080p"]
}
```

---

### Step 1 — Download Raw File

The Worker downloads the raw file from MinIO to a local temp directory:

```
/tmp/{videoId}/original.mp4
```

This is necessary because FFmpeg operates on local files. The file is deleted after processing completes.

---

### Step 2 — Transcode to HLS

The Worker runs FFmpeg once per quality profile. Each run produces:

- A segmented video stream (`.ts` files, 6 seconds each)
- A quality-level playlist (`playlist.m3u8`)

**Quality Profiles**

| Quality | Resolution | Video Bitrate | Audio Bitrate |
| ------- | ---------- | ------------- | ------------- |
| 360p    | 640×360    | 800k          | 128k          |
| 720p    | 1280×720   | 2800k         | 128k          |
| 1080p   | 1920×1080  | 5000k         | 192k          |

**Example FFmpeg Command (720p)**

```bash
ffmpeg -i original.mp4 \
  -vf scale=1280:720 \
  -c:v libx264 -crf 23 -preset fast \
  -c:a aac -b:a 128k \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_filename "segment_%03d.ts" \
  /tmp/{videoId}/720p/playlist.m3u8
```

After all qualities are transcoded, a **master playlist** is generated referencing all quality levels. The HLS player uses this to automatically switch quality based on available bandwidth (Adaptive Bitrate Streaming).

**Master Playlist (`master.m3u8`)**

```
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
```

---

### Step 3 — Upload HLS Output to MinIO

All generated files are uploaded to MinIO under a structured path:

```
videos/
  {videoId}/
    master.m3u8
    360p/
      playlist.m3u8
      segment_000.ts
      segment_001.ts
      ...
    720p/
      playlist.m3u8
      segment_000.ts
      ...
    1080p/
      playlist.m3u8
      segment_000.ts
      ...
```

---

### Step 4 — Finalize

After all segments are uploaded the Worker:

1. Updates the video record in the database with:
   - `status: "ready"`
   - `masterPlaylistPath: "videos/{videoId}/master.m3u8"`
2. Deletes the local temp directory (`/tmp/{videoId}/`)
3. Publishes a `video.processed` event to RabbitMQ so downstream services (e.g. WebSocket notification service) can inform the client

---

## Error Handling

| Scenario                            | Behavior                                                   |
| ----------------------------------- | ---------------------------------------------------------- |
| Chunk upload fails                  | Client retries that individual chunk                       |
| MinIO unavailable during processing | Worker nacks with requeue — job retried                    |
| Corrupt or unreadable video file    | Worker nacks without requeue — video marked `failed` in DB |
| FFmpeg crash mid-transcode          | Partial segments discarded, job sent to dead letter queue  |
| All retries exhausted               | Job lands in dead letter queue for manual inspection       |

The dead letter queue is a RabbitMQ exchange that catches jobs that have failed beyond the retry threshold. It allows inspection and manual reprocessing without data loss.

---

## Video Status Lifecycle

```
pending → processing → ready
                    ↘ failed
```

| Status       | Description                                         |
| ------------ | --------------------------------------------------- |
| `pending`    | Upload initialized, chunks not yet complete         |
| `processing` | Raw file received, transcoding in progress          |
| `ready`      | HLS output available, video can be streamed         |
| `failed`     | Transcoding failed permanently, requires inspection |

---

## Dubs & Subtitles

Both fit naturally into the existing pipeline with no structural changes. They are purely additive.

### Subtitles

Subtitles are text files (`.vtt` format) and do not go through FFmpeg. They are uploaded separately via the admin panel and stored directly in MinIO alongside the HLS output.

```
videos/
  {videoId}/
    master.m3u8
    360p/
    720p/
    1080p/
    subtitles/
      en.vtt
      pt-BR.vtt
      jp.vtt
```

The HLS master playlist natively supports subtitle tracks:

```
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",
  LANGUAGE="en",URI="subtitles/en.vtt"

#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Português",
  LANGUAGE="pt-BR",URI="subtitles/pt-BR.vtt"
```

The HLS player handles track switching automatically. No FFmpeg changes required.

---

### Dubs (Multiple Audio Tracks)

Each dub is a separate audio-only HLS stream stored under an `audio/` directory:

```
videos/
  {videoId}/
    master.m3u8
    360p/
    720p/
    1080p/
    audio/
      ja/
        playlist.m3u8
        segment_000.aac
        ...
      en/
        playlist.m3u8
        segment_000.aac
        ...
    subtitles/
```

The Worker processes each dub audio file through FFmpeg as an additional step in `transcoding.processor.ts`:

```bash
ffmpeg -i dub-en.mp3 \
  -c:a aac -b:a 128k \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_filename "segment_%03d.aac" \
  audio/en/playlist.m3u8
```

The master playlist references them as alternate audio renditions:

```
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Japanese",
  LANGUAGE="ja",DEFAULT=YES,URI="audio/ja/playlist.m3u8"

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English Dub",
  LANGUAGE="en",URI="audio/en/playlist.m3u8"
```

---

### What Changes in the Existing Structure

**Database** — a `video_assets` table tracks all assets belonging to a video (dubs, subtitles, languages, MinIO paths, and processing status).

**RabbitMQ message** — extended to include dub and subtitle references:

```json
{
  "videoId": "uuid",
  "rawObjectPath": "raw/uuid/original.mp4",
  "qualities": ["360p", "720p", "1080p"],
  "dubs": [
    { "language": "ja", "path": "raw/uuid/audio-ja.mp3" },
    { "language": "en", "path": "raw/uuid/audio-en.mp3" }
  ],
  "subtitles": [
    { "language": "en", "path": "raw/uuid/subs-en.vtt" },
    { "language": "pt-BR", "path": "raw/uuid/subs-pt.vtt" }
  ]
}
```

**Worker** — after transcoding video qualities, processes each dub through FFmpeg and copies subtitle files directly to MinIO, then assembles the master playlist with all tracks included.

**Admin panel** — separate upload flows for attaching dubs and subtitles to an episode after the main video is already uploaded.

The core upload and processing architecture remains unchanged. This feature is safe to implement as a later iteration.

---

## Streaming to the Client

When a user plays a video, the API returns a short-lived **presigned URL** for the master playlist:

```
GET /videos/:videoId/stream
→ { "url": "https://minio.host/videos/{videoId}/master.m3u8?token=..." }
```

The frontend HLS player (`hls.js` or `video.js`) receives the master playlist URL and handles everything from there — fetching the correct quality playlist, downloading segments, and switching quality automatically based on network conditions.

---

## Services Involved

| Service  | Responsibilities                                                              |
| -------- | ----------------------------------------------------------------------------- |
| `api`    | Receive chunks, compose raw file in MinIO, publish job to RabbitMQ            |
| `worker` | Download raw file, run FFmpeg, upload HLS segments to MinIO, update DB status |
| MinIO    | Store raw uploads (temporary) and final HLS output (permanent)                |
| RabbitMQ | Decouple upload completion from transcoding, buffer jobs, handle retries      |
| Database | Track upload state, video status, and stream URLs                             |
