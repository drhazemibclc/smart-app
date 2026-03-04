// lib/storage/minio.service.ts

import type { Readable } from 'node:stream';

import { Client } from 'minio';

interface UploadOptions {
  bucket: string;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class MinioService {
  private client: Client;
  private defaultBucket: string;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: Number.parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });
    this.defaultBucket = process.env.MINIO_BUCKET || 'local-dev-bucket';
  }

  async uploadFile(file: Buffer | Readable, options: UploadOptions): Promise<string> {
    const bucket = options.bucket || this.defaultBucket;
    const metaData = options.metadata || {};

    try {
      await this.client.putObject(bucket, options.key, file, undefined, metaData);

      // Generate URL
      const url = await this.getFileUrl(bucket, options.key);
      console.log('File uploaded to MinIO:', url);

      return url;
    } catch (error) {
      console.error('Failed to upload to MinIO:', error);
      throw error;
    }
  }

  async getFileUrl(bucket: string, key: string): Promise<string> {
    // For local development, return direct MinIO URL
    return `http://localhost:9000/${bucket}/${key}`;
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, key);
      console.log('File deleted from MinIO:', key);
    } catch (error) {
      console.error('Failed to delete from MinIO:', error);
      throw error;
    }
  }

  async listFiles(bucket: string, prefix?: string): Promise<string[]> {
    const objects: string[] = [];
    const stream = this.client.listObjects(bucket, prefix, true);

    return new Promise((resolve, reject) => {
      stream.on('data', obj => {
        if (obj.name) {
          objects.push(obj.name);
        }
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(objects));
    });
  }
}
