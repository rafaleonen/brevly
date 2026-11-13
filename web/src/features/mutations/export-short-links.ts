import { apiClient } from "@/shared/api/apiClient";
import { useMutation } from "@tanstack/react-query";

interface ExportShortLinksResponse {
  url: string;
  key: string;
}

async function exportShortLinks(
  signal?: AbortSignal
): Promise<ExportShortLinksResponse> {
  const response = await apiClient.post("/short-links/export", undefined, {
    signal,
  });

  if (!response.data) {
    throw new Error("Fail to export!");
  }

  return response.data;
}

export function useExportShortLinksMutation() {
  return useMutation({
    mutationFn: () => exportShortLinks(),
  });
}
