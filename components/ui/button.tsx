import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      loading = false,
      fullWidth = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500",
      secondary:
        "bg-surface-200 dark:bg-surface-800 text-ink dark:text-white hover:bg-surface-300 dark:hover:bg-surface-700 focus:ring-surface-300",
      outline:
        "border border-surface-300 dark:border-surface-800 text-ink dark:text-white bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 focus:ring-surface-300",
      ghost:
        "text-ink-muted dark:text-surface-300 hover:text-ink dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 focus:ring-surface-300",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
    }[variant];

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 h-8 gap-1.5",
      md: "text-sm px-5 py-2.5 h-11 gap-2",
      lg: "text-base px-7 py-3.5 h-13 min-h-[50px] gap-2.5",
    }[size];

    const widthStyle = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyle} ${className}`.trim();

    if (href && !disabled) {
      return (
        <Link href={href} className={combinedClassName}>
          {loading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={combinedClassName}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
