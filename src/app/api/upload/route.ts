// src/app/api/upload/route.ts
import { type NextRequest, NextResponse } from 'next/server';

import { minioClient } from '@/lib/minio/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    // Upload to Minio
    await minioClient?.putObject(process.env.MINIO_BUCKET_NAME || 'uploads', fileName, buffer);

    return NextResponse.json({
      success: true,
      fileName,
      url: `/api/files/${fileName}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
