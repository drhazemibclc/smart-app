import { NextResponse } from 'next/server';

import { createCompleteEncounterAction } from '@/actions/encounter.action';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createCompleteEncounterAction(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Encounter creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create encounter'
      },
      { status: 400 }
    );
  }
}
