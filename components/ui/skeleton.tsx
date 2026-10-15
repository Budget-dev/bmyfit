import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-200 dark:bg-surface-800 ${className}`}
      {...props}
    />
  );
}
