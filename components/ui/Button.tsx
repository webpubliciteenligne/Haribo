import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function Button({ className, isLoading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex w-full items-center justify-center rounded-md bg-brand-accent px-6 py-3.5",
        "text-base font-semibold text-white transition-opacity duration-150",
        "hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Envoi en cours…" : children}
    </button>
  );
}
