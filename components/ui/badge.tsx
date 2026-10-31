import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
    | "emerald"
    | "amber";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "", ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent",
    secondary: "bg-surface-200 text-ink dark:bg-surface-800 dark:text-white border-transparent",
    destructive: "bg-rose-600 text-white border-transparent",
    outline: "text-foreground border-surface-300 dark:border-surface-700",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    info: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    neutral: "bg-surface-100 text-ink-muted dark:bg-surface-800 dark:text-surface-300 border-surface-200 dark:border-surface-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
