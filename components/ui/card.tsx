import React from "react";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  hoverEffect?: boolean;
  children?: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  badge,
  hoverEffect = false,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-card transition-all duration-200 ${
        hoverEffect ? "hover:-translate-y-1 hover:shadow-float hover:border-emerald-300 dark:hover:border-emerald-700" : ""
      } ${className}`}
      {...props}
    >
      {(title || subtitle || badge) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-lg font-bold tracking-tight text-ink dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-ink-muted dark:text-surface-300">
                {subtitle}
              </p>
            )}
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
