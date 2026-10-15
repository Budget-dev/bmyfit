import React from "react";

export interface GaugeZone {
  label: string;
  min: number;
  max: number;
  color: string;
}

export interface GaugeProps {
  value: number;
  min: number;
  max: number;
  unit?: string;
  zones: GaugeZone[];
  currentCategoryLabel?: string;
  className?: string;
}

export function Gauge({
  value,
  min,
  max,
  unit = "",
  zones,
  currentCategoryLabel,
  className = "",
}: GaugeProps) {
  // Clamp value percentage between 0 and 100
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Category header */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-ink dark:text-white">
            {value.toFixed(1)}
          </span>
          {unit && (
            <span className="text-sm font-semibold text-ink-muted dark:text-surface-400">
              {unit}
            </span>
          )}
        </div>
        {currentCategoryLabel && (
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-ink dark:text-white border border-surface-200 dark:border-surface-700">
            {currentCategoryLabel}
          </span>
        )}
      </div>

      {/* Visual multi-segmented gauge track */}
      <div className="relative pt-3 pb-1">
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-surface-200 dark:bg-surface-800 shadow-inner">
          {zones.map((zone, idx) => {
            const width = ((zone.max - zone.min) / (max - min)) * 100;
            return (
              <div
                key={idx}
                className={`${zone.color} h-full opacity-90 transition-opacity`}
                style={{ width: `${width}%` }}
                title={`${zone.label}: ${zone.min} - ${zone.max}${unit}`}
              />
            );
          })}
        </div>

        {/* Current position needle / pointer indicator */}
        <div
          className="absolute top-1 -ml-2 transition-all duration-500 ease-out flex flex-col items-center"
          style={{ left: `${percentage}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-ink dark:bg-white shadow-md border-2 border-white dark:border-ink ring-2 ring-emerald-500" />
        </div>
      </div>

      {/* Zone labels */}
      <div className="flex justify-between mt-2 text-[10px] sm:text-xs font-medium text-ink-muted dark:text-surface-400">
        {zones.map((zone, idx) => (
          <span key={idx} className="truncate">
            {zone.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export const BMI_GAUGE_ZONES: GaugeZone[] = [
  { label: "Underweight", min: 14, max: 18.5, color: "bg-amber-400" },
  { label: "Normal", min: 18.5, max: 24.9, color: "bg-emerald-500" },
  { label: "Overweight", min: 25, max: 29.9, color: "bg-orange-400" },
  { label: "Obese", min: 30, max: 40, color: "bg-rose-500" },
];

export const MALE_BODY_FAT_GAUGE_ZONES: GaugeZone[] = [
  { label: "Essential", min: 2, max: 5.9, color: "bg-sky-400" },
  { label: "Athletes", min: 6, max: 13.9, color: "bg-emerald-400" },
  { label: "Fitness", min: 14, max: 17.9, color: "bg-emerald-500" },
  { label: "Average", min: 18, max: 24.9, color: "bg-amber-400" },
  { label: "Obese", min: 25, max: 40, color: "bg-rose-500" },
];

export const FEMALE_BODY_FAT_GAUGE_ZONES: GaugeZone[] = [
  { label: "Essential", min: 10, max: 13.9, color: "bg-sky-400" },
  { label: "Athletes", min: 14, max: 20.9, color: "bg-emerald-400" },
  { label: "Fitness", min: 21, max: 24.9, color: "bg-emerald-500" },
  { label: "Average", min: 25, max: 31.9, color: "bg-amber-400" },
  { label: "Obese", min: 32, max: 45, color: "bg-rose-500" },
];
