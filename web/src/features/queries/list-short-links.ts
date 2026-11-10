import { apiClient } from "@/shared/api/apiClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ShortLinkSortValue } from "../constants/sort";

export type ShortLink = {
  id: string;
  code: string;
  url: string;
  clicks: number;
};

type Paginated<T> = {
  items: T[];
  nextCursor: string | null;
};

type FetchParams = {
  cursor?: string;
  sort: ShortLinkSortValue;
  limit?: number;
};

export async function listShortLinks(
  { cursor, sort, limit = 10 }: FetchParams,
  signal: AbortSignal
) {
  const params = new URLSearchParams({ sort, limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  const response = await apiClient(`/short-links?${params}`, { signal });

  if (!response.data) throw new Error("Erro ao buscar links");

  return response.data as Paginated<ShortLink>;
}

export const LIST_SHORT_LINKS_QUERY_KEY = "list-short-links" as const;

export function useInfiniteListShortLinks(sort: ShortLinkSortValue) {
  const { data, ...query } = useInfiniteQuery({
    queryKey: [LIST_SHORT_LINKS_QUERY_KEY, { sort }],
    queryFn: ({ pageParam, signal }) =>
      listShortLinks({ cursor: pageParam, sort }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const shortLinks = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  return {
    ...query,
    data,
    shortLinks,
  };
}
