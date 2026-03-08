import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCopyCommand,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { Readable } from 'stream';

import { buildStorageKey, type MediaPurpose } from '@animora/contracts';

import { S3_CLIENT } from './s3.tokens';

@Injectable()
export class S3Service {
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    private readonly config: ConfigService,
  ) {
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    this.endpoint = config.getOrThrow<string>('S3_ENDPOINT');
  }

  async upload(
    folder: string,
    buffer: Buffer,
    mimeType: string,
    ext: string,
  ): Promise<string> {
    const key = `${folder}/${randomUUID()}.${ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return key;
  }

  async putObject(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  }

  async putStream(key: string, stream: Readable): Promise<void> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentLength: buffer.length,
      }),
    );
  }

  /**
   * Composes multiple existing objects into one via S3 multipart upload copy.
   * Source objects must each be ≥ 5 MB (except the last one).
   */
  async composeObjects(sourceKeys: string[], targetKey: string): Promise<void> {
    const { UploadId } = await this.client.send(
      new CreateMultipartUploadCommand({ Bucket: this.bucket, Key: targetKey }),
    );

    try {
      const parts = await Promise.all(
        sourceKeys.map((sourceKey, i) =>
          this.client
            .send(
              new UploadPartCopyCommand({
                Bucket: this.bucket,
                Key: targetKey,
                UploadId: UploadId!,
                PartNumber: i + 1,
                CopySource: `${this.bucket}/${sourceKey}`,
              }),
            )
            .then((res) => ({
              PartNumber: i + 1,
              ETag: res.CopyPartResult!.ETag!,
            })),
        ),
      );

      await this.client.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.bucket,
          Key: targetKey,
          UploadId: UploadId!,
          MultipartUpload: { Parts: parts },
        }),
      );
    } catch (err) {
      await this.client.send(
        new AbortMultipartUploadCommand({
          Bucket: this.bucket,
          Key: targetKey,
          UploadId: UploadId!,
        }),
      );
      throw err;
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  getMediaUrl(purpose: MediaPurpose, filename: string): string {
    const key = buildStorageKey(purpose, filename);
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}
