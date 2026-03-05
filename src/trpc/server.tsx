// apps/web/src/trpc/server.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <ok> */
import 'server-only';

import type { DefaultError, FetchQueryOptions, InfiniteData, QueryKey } from '@tanstack/react-query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy, type TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { cache } from 'react';

import { createCallerFactory } from '@/server/api';
import { createTRPCContext } from '@/server/api/context';
import { appRouter } from '@/server/api/routers/index';

import { makeQueryClient } from './query-client';

export const getQueryClient = cache(() => makeQueryClient());

const createServerContext = cache(async () => {
  return createTRPCContext();
});

// Server-side tRPC client
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient
});

export const caller = appRouter.createCaller(createTRPCContext);

export const createCaller = cache(async () => {
  const ctx = await createServerContext();
  return createCallerFactory(appRouter)(ctx);
});
// export async function prefetch<
//   TQueryFnData = unknown,
//   TError = DefaultError,
//   TData = TQueryFnData,
//   TQueryKey extends QueryKey = QueryKey
// >(queryOptions: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>): Promise<void> {
//   const queryClient = getQueryClient();

//   try {
//     await queryClient.prefetchQuery(queryOptions);
//   } catch (error) {
//     // Log but don't throw - prefetch errors shouldn't break the page
//     console.error('Error prefetching:', error);
//   }
// }

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
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
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}
