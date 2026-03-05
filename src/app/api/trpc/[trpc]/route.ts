import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { createTRPCContext as createContext } from '@/server/api/context';
import { appRouter } from '@/server/api/routers/index';

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext()
  });
}
export { handler as GET, handler as POST };
