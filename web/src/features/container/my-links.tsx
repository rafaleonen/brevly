import { Button } from "@/shared/ui/button";
import { Divider } from "@/shared/ui/divider";
import { Typography } from "@/shared/ui/typography";
import { Download } from "lucide-react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-variants";
import { EmptyList } from "../components/empty-list";

type MyLinksContainerProps = ComponentProps<"div">;

export function MyLinksContainer({
  className,
  ...props
}: MyLinksContainerProps) {
  return (
    <div
      className={twMerge(
        "bg-white p-8 flex flex-col gap-6 rounded-lg",
        className
      )}
      {...props}
    >
      <div className="flex justify-between">
        <Typography>Meus link</Typography>
        <Button size="normal" color="gray" disabled>
          <Download size={16} strokeWidth={1.5} />
          <span className="leading-4 text-xs font-semibold font-sans">
            Baixar CSV
          </span>
        </Button>
      </div>

      <Divider />

      <EmptyList />
    </div>
  );
}
