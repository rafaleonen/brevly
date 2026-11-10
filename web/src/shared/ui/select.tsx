import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-variants";

type SelectProps = ComponentProps<"select"> & {
  options: {
    label: string;
    value: string;
  }[];
};

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={twMerge(
          "h-8 appearance-none cursor-pointer",
          "rounded-sm border border-transparent bg-gray-200",
          "pl-2 pr-7 text-xs font-semibold text-gray-600",
          "transition-colors hover:border-blue-base",
          "focus:outline-none focus:ring-2 focus:ring-blue-dark/40",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
      />
    </div>
  );
}
