export async function downloadFile(
  url: string,
  fileName = fileNameFromUrl(url)
): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    try {
      clickLink(objectUrl, fileName);
    } finally {
      // Give the browser a tick to start the download before revoking.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    }
  } catch {
    clickLink(url, fileName, { newTab: true });
  }
}

function clickLink(
  href: string,
  fileName: string,
  { newTab = false }: { newTab?: boolean } = {}
) {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;

  if (newTab) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  document.body.appendChild(link);
  link.click();
  link.remove();
}

function fileNameFromUrl(url: string): string {
  const lastSegment = new URL(url).pathname.split("/").pop();
  return lastSegment ? decodeURIComponent(lastSegment) : "download";
}
