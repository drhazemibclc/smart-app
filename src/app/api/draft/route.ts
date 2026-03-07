import type { Route } from 'next';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

// This is a secure endpoint to enable draft mode
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  // Only enable draft mode if secret matches
  if (secret !== process.env.DRAFT_SECRET || !slug) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect safely to the slug path
  redirect(slug as Route);
}
