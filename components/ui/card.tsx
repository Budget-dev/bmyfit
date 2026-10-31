import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  hoverEffect?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, badge, hoverEffect = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-card transition-all duration-200",
          hoverEffect && "hover:-translate-y-1 hover:shadow-float hover:border-emerald-300 dark:hover:border-emerald-700",
          className
        )}
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
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-bold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
