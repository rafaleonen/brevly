import { apiClient } from "@/shared/api/apiClient";
import type { ShortLink } from "@/shared/models/short-link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GET_SHORT_LINK_BY_SLUG_QUERY_KEY } from "../queries/get-short-link-by-slug";
import { LIST_SHORT_LINKS_QUERY_KEY } from "../queries/list-short-links";

async function incrementShortLinkClickBySlug(
  slug: string,
  signal?: AbortSignal
): Promise<ShortLink> {
  const response = await apiClient.patch(
    `/short-links/slug/${slug}/increment`,
    {
      signal,
    }
  );

  if (!response.data) {
    throw new Error("Short Link not found!");
  }

  return response.data;
}

export function useIncrementShortLinkClickMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => incrementShortLinkClickBySlug(slug),
    onSuccess: (_data, slug) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: [GET_SHORT_LINK_BY_SLUG_QUERY_KEY, slug],
        }),
        queryClient.invalidateQueries({
          queryKey: [LIST_SHORT_LINKS_QUERY_KEY],
        }),
      ]);
    },
  });
}
