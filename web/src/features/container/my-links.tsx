import { Button } from "@/shared/ui/button";
import { Divider } from "@/shared/ui/divider";
import { Select } from "@/shared/ui/select";
import { Typography } from "@/shared/ui/typography";
import { Download } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { twMerge } from "tailwind-variants";
import { EmptyList } from "../components/empty-list";
import { ListOfLinks } from "../components/list-of-links";
import { SHORT_LINK_SORT, type ShortLinkSortValue } from "../constants/sort";
import { useDeleteShortLinkMutation } from "../mutations/delete-short-link-by-slug";
import { useInfiniteListShortLinks } from "../queries/list-short-links";

type MyLinksContainerProps = ComponentProps<"div">;

export function MyLinksContainer({
  className,
  ...props
}: MyLinksContainerProps) {
  const [sort, setSort] = useState<ShortLinkSortValue>("id_desc");

  const { shortLinks, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteListShortLinks(sort);

  const { mutateAsync: deleteShortLink } = useDeleteShortLinkMutation();

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" } // começa a carregar um pouco antes do fim
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  async function handleDelete(slug: string) {
    await deleteShortLink(slug);
  }

  async function handleCopy(slug: string) {
    const origin = window.location.origin;

    await navigator.clipboard.writeText(`${origin}/redirect?slug=${slug}`);
  }

  return (
    <div
      className={twMerge(
        "bg-white p-8 flex flex-col gap-6 rounded-lg",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Typography>Meus links</Typography>
        <div className="gap-4 flex">
          <Select
            options={SHORT_LINK_SORT}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />

          <Button variant="secondary" disabled>
            <Download size={16} strokeWidth={1.5} />
            <span className="leading-4 text-xs font-semibold font-sans">
              Baixar CSV
            </span>
          </Button>
        </div>
      </div>

      <Divider />

      {shortLinks.length ? (
        <ListOfLinks
          links={shortLinks}
          onCopy={handleCopy}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyList />
      )}

      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center">
          <Typography variant="xs">Carregando mais...</Typography>
        </div>
      )}
    </div>
  );
}
