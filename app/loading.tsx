import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16" aria-live="polite">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-16 h-16 rounded-full border-4 border-neutral-200 dark:border-neutral-800 border-t-brand-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Loading BMYFIT...
        </p>
      </div>
    </div>
  );
}
