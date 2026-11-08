import { Typography } from "@/shared/ui/typography";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-variants";
import { NewLinkForm } from "../components/new-link-form";

type NewLinkContainerProps = ComponentProps<"div">;

export function NewLinkContainer({
  className,
  ...props
}: NewLinkContainerProps) {
  return (
    <div
      className={twMerge(
        "bg-white p-8 flex flex-col gap-6 rounded-lg",
        className
      )}
      {...props}
    >
      <Typography>Novo link</Typography>

      <NewLinkForm />
    </div>
  );
}
