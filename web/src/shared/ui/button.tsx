import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed",
  variants: {
    variant: {
      primary:
        "w-full h-12 rounded-lg bg-blue-base enabled:hover:bg-blue-dark text-white disabled:bg-blue-base/50 disabled:text-white/50",
      secondary:
        "rounded-sm p-2 gap-1.5 bg-gray-200 enabled:hover:border enabled:hover:border-blue-base text-gray-600 disabled:bg-gray-200/50 disabled:text-gray-600/50",
    },
  },

  defaultVariants: {
    variant: "primary",
  },
});

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, className })} {...props} />
  );
}
