import type { ComponentProps } from "react";
import { twMerge } from "tailwind-variants";

type DividerProps = ComponentProps<"div">;

export function Divider({ className, ...props }: DividerProps) {
  return (
    <div className={twMerge("h-px w-full bg-gray-200", className)} {...props} />
  );
}
