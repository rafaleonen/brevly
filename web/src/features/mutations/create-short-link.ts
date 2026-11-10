import { apiClient } from "@/shared/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GET_SHORT_LINK_BY_SLUG_QUERY_KEY } from "../queries/get-short-link-by-slug";
import { LIST_SHORT_LINKS_QUERY_KEY } from "../queries/list-short-links";

export interface CreateShortLink {
  slug: string;
  originalUrl: string;
}

async function createShortLink(
  data: CreateShortLink,
  signal?: AbortSignal
): Promise<void> {
  await apiClient.post("/short-links", data, {
    signal,
  });
}

export function useCreateShortLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShortLink) => createShortLink(data),
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: [GET_SHORT_LINK_BY_SLUG_QUERY_KEY, variables.slug],
        }),
        queryClient.invalidateQueries({
          queryKey: [LIST_SHORT_LINKS_QUERY_KEY],
        }),
      ]);
    },
  });
}
