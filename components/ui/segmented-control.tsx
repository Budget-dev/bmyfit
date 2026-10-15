import React from "react";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  className?: string;
  error?: string;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  className = "",
  error,
}: SegmentedControlProps<T>) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-surface-300">
          {label}
        </label>
      )}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900/60 p-1.5"
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                isSelected
                  ? "bg-white dark:bg-surface-800 text-ink dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-ink-muted dark:text-surface-300 hover:text-ink dark:hover:text-white"
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
