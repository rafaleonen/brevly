import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed",
  variants: {
    size: {
      full: "w-full h-12 rounded-lg",
      normal: "h-8 rounded-sm p-2 gap-1.5",
      icon: "h-4 w-4 p-2",
    },

    color: {
      blue: "bg-blue-base enabled:hover:bg-blue-dark text-white disabled:bg-blue-base/50 disabled:text-white/50",
      gray: "bg-gray-200 enabled:hover:border enabled:hover:border-blue-base text-gray-600 disabled:bg-gray-200/50 disabled:text-gray-600/50",
    },
  },

  defaultVariants: {
    size: "full",
    color: "blue",
  },
});

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({ size, className, color, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ color, size, className })} {...props} />
  );
}
