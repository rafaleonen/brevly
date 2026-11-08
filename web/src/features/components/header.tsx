import logo from "@/shared/assets/svg/logo.svg";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-variants";

type HeaderProps = ComponentProps<"header">;

export function Header({ className, ...props }: HeaderProps) {
  return (
    <header className={twMerge("flex", className)} {...props}>
      <img src={logo} alt="brev.ly" className="h-6" />
    </header>
  );
}
