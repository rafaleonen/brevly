import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const typographyVariants = tv({
  base: "font-sans text-gray-600",
  variants: {
    variant: {
      xl: "text-xl font-bold leading-8",
      lg: "text-lg font-bold leading-6 ",
      md: "text-md font-semibold leading-4.5",
      sm: "text-sm leading-4",
      xs: "text-xs leading-3.5",
    },
  },

  defaultVariants: {
    variant: "lg",
  },
});

type TypographyProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants>;

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

type TypographyTag = "h3" | "h4" | "span";

const tagMap: Record<TypographyVariant, TypographyTag> = {
  xl: "h3",
  lg: "h4",
  md: "span",
  sm: "span",
  xs: "span",
};

export function Typography({
  variant = "lg",
  className,
  ...props
}: TypographyProps) {
  const Tag = tagMap[variant];

  return (
    <Tag className={typographyVariants({ variant, className })} {...props} />
  );
}
