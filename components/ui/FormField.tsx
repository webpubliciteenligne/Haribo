import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper accessible : label lié, message d'erreur annoncé via aria-live,
 * cohérent sur tous les champs du formulaire.
 */
export function FormField({ label, htmlFor, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-brand/90">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" aria-live="polite" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
