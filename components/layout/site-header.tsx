import React from "react";
import { BmyFitLogo } from "./logo";
import { Button } from "@/components/ui/button";

export function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-200/80 dark:border-surface-800/80 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md transition-colors">
      <div className="container flex h-16 items-center justify-between">
        <BmyFitLogo />

        <div className="flex items-center gap-3">
          {showCta && (
            <Button href="/details" size="sm" variant="primary">
              Start Now
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
