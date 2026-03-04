// apps/web/src/trpc/server.tsx
import 'server-only';

import type { DefaultError, FetchQueryOptions, InfiniteData, QueryKey } from '@tanstack/react-query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { cache } from 'react';

import { createCallerFactory } from '@/server/api';
import { createTRPCContext } from '@/server/api/context';
import { type AppRouter, appRouter } from '@/server/api/routers/index';

import { makeQueryClient } from './query-client';

export const getQueryClient = cache(() => makeQueryClient());

const createServerContext = cache(async () => {
  const heads = await headers();

  return createTRPCContext({
    headers: heads
  } as unknown as NextRequest);
});

// Server-side tRPC client
export const trpc = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: await createServerContext(),
  queryClient: getQueryClient
});

export const createCaller = cache(async () => {
  const ctx = await createServerContext();
  return createCallerFactory(appRouter)(ctx);
});
export async function prefetch<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(queryOptions: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>): Promise<void> {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(queryOptions);
  } catch (error) {
    // Log but don't throw - prefetch errors shouldn't break the page
    console.error('Error prefetching:', error);
  }
}

/**
 * Separate function for infinite queries
 * Uses InfiniteData to correctly type the pages and pageParams
 */
export async function prefetchInfinite<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown
>(
  queryOptions: FetchQueryOptions<TQueryFnData, TError, InfiniteData<TData, TPageParam>, TQueryKey, TPageParam>
): Promise<void> {
  const queryClient = getQueryClient();

  try {
    // @ts-expect-error - prefetchInfiniteQuery has strict internal requirement for FetchInfiniteQueryOptions
    await queryClient.prefetchInfiniteQuery(queryOptions);
  } catch (error) {
    console.error('Error prefetching infinite query:', error);
  }
}

// HydrateClient component
export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  // No changes needed here, dehydrate(queryClient) returns DehydratedState automatically
  const dehydratedState = dehydrate(queryClient);

  return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
}
