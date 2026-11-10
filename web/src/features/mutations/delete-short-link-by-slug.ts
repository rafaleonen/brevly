import { apiClient } from "@/shared/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GET_SHORT_LINK_BY_SLUG_QUERY_KEY } from "../queries/get-short-link-by-slug";
import { LIST_SHORT_LINKS_QUERY_KEY } from "../queries/list-short-links";

async function deleteShortLink(
  slug: string,
  signal?: AbortSignal
): Promise<void> {
  await apiClient.delete(`/short-links/slug/${slug}`, {
    signal,
  });
}

export function useDeleteShortLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShortLink(id),
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
