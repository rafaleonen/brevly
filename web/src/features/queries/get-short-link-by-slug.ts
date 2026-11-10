import { apiClient } from "@/shared/api/apiClient";
import type { ShortLink } from "@/shared/models/short-link";
import { useQuery } from "@tanstack/react-query";

async function getShortLinkBySlug(
  slug: string,
  signal?: AbortSignal
): Promise<ShortLink> {
  const response = await apiClient.get(
    `/short-links/slug/${encodeURIComponent(slug)}`,
    {
      signal,
    }
  );

  if (!response.data) {
    throw new Error("Short Link not found");
  }

  return response.data;
}

export const GET_SHORT_LINK_BY_SLUG_QUERY_KEY =
  "get-short-link-by-slug" as const;

export function useGetShortLinkBySlugQuery(slug?: string) {
  return useQuery({
    queryKey: [GET_SHORT_LINK_BY_SLUG_QUERY_KEY, slug],
    queryFn: ({ signal }) => getShortLinkBySlug(slug, signal),
    enabled: !!slug,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
