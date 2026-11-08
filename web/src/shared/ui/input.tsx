import { AlertTriangleIcon } from "lucide-react";
import { useId, type ComponentProps } from "react";
import { twMerge } from "tailwind-variants";

type InputProps = ComponentProps<"input"> & {
  label: string;
  isFilled?: boolean;
  error?: string;
  prefix?: string;
};

export function Input({
  id,
  prefix,
  label,
  error,
  className,
  isFilled,
  ...props
}: InputProps) {
  const inputId = id ?? useId();

  const hasError = !!error;
  return (
    <div data-error={hasError} className="w-full flex flex-col gap-2 group">
      <label
        htmlFor={inputId}
        className={twMerge(
          "text-xs leading-3.5 text-gray-500 uppercase",
          "group-focus-within:text-blue-base",
          "group-data-[error=true]:text-danger"
        )}
      >
        {label}
      </label>

      <label
        htmlFor={inputId}
        className={twMerge(
          "flex cursor-text w-full h-12 items-center rounded-lg border border-gray-300 px-4",
          "focus-within:border-blue-base focus-within:ring-[0.5px] focus-within:ring-bluse-base",
          "group-data-[error=true]:border-danger group-data-[error=true]:ring-[0.5px] group-data-[error=true]:ring-danger group-data-[error=true]:focus-within:border-danger"
        )}
      >
        {prefix && (
          <span
            aria-hidden
            className={twMerge(
              "text-base leading-5 text-gray-300 select-none group-focus-within:text-gray-600",
              isFilled && "text-gray-600"
            )}
          >
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={hasError}
          data-error={hasError}
          className={twMerge(
            "h-full w-full bg-transparent text-sm leading-4.5 placeholder:text-gray-300 outline-none rounded-lg text-gray-600",
            className
          )}
          {...props}
        />
      </label>

      {hasError && (
        <div className="flex items-center gap-2">
          <AlertTriangleIcon
            size={18}
            strokeWidth={1.5}
            className="text-danger"
          />
          <span className="text-sm text-gray-500">{error}</span>
        </div>
      )}
    </div>
  );
}
