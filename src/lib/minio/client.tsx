// src/lib/minio/client.ts
// This file should only be imported on the server side

import * as Minio from 'minio';

// Only initialize on server side
const isServer = typeof window === 'undefined';

let minioClient: Minio.Client | null = null;

if (isServer) {
  minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: Number.parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || ''
  });
}

export { minioClient };
