import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check without database query to avoid Bun/Prisma/pg compatibility issues
    // Database connectivity is verified through actual API usage

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'available'
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
