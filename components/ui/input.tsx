import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, suffix, id, className = "", ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-surface-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={`w-full rounded-xl border bg-white dark:bg-surface-900 px-4 py-3 text-sm font-medium text-ink dark:text-white placeholder:text-surface-300 dark:placeholder:text-surface-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 ${
              error
                ? "border-rose-400 focus:ring-rose-400"
                : "border-surface-300 dark:border-surface-800 hover:border-surface-400 dark:hover:border-surface-700"
            } ${suffix ? "pr-14" : ""} ${className}`}
            {...props}
          />
          {suffix && (
            <div className="pointer-events-none absolute right-4 flex items-center text-xs font-bold text-ink-muted dark:text-surface-300">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 text-xs font-medium text-rose-500"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-xs text-ink-muted dark:text-surface-300"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
