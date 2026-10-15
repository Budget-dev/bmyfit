"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log safe error telemetry without PII
    console.error("Application error:", error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500 font-bold text-2xl">
          !
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-neutral-100">
            Something went wrong
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            We encountered an unexpected issue while loading your fitness data. Please try again or return home.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="primary" onClick={reset} className="w-full sm:w-auto">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
