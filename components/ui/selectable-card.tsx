import React from "react";

export interface SelectableCardProps {
  id?: string;
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
}

export function SelectableCard({
  id,
  selected,
  onSelect,
  title,
  description,
  icon,
  badge,
  className = "",
}: SelectableCardProps) {
  return (
    <button
      id={id}
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`group relative w-full text-left rounded-2xl p-6 transition-all duration-200 border-2 select-none focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[110px] ${
        selected
          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/20"
          : "border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-700 shadow-sm hover:shadow"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {icon && (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                selected
                  ? "bg-emerald-500 text-white"
                  : "bg-surface-100 dark:bg-surface-800 text-ink-muted dark:text-surface-300 group-hover:text-ink dark:group-hover:text-white"
              }`}
            >
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-ink dark:text-white">{title}</h4>
              {badge && (
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted dark:text-surface-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Selection indicator radio/check */}
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all mt-0.5 ${
            selected
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800"
          }`}
        >
          {selected && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
