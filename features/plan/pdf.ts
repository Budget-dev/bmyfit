/**
 * Lightweight, zero-dependency PDF print solution.
 * Uses native window.print() combined with print-optimized CSS rules
 * in globals.css (@media print) to deliver high-quality, branded PDF output.
 */

export function triggerPrintPlan(): void {
  if (typeof window === "undefined") return;
  window.print();
}

export function formatPlanDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}
