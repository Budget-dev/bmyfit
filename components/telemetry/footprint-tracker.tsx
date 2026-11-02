"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordFootprint, type FootprintStage } from "@/lib/telemetry/footprints";

const PATH_STAGE_MAP: Record<string, FootprintStage> = {
  "/": "landing",
  "/goal": "goal_selected",
  "/details": "details_entered",
  "/calculating": "calculating_viewed",
  "/result": "result_viewed",
  "/checkout": "checkout_viewed",
  "/plan": "plan_waiting",
};

export function FootprintTracker() {
  const pathname = usePathname();
  const lastRecordedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    if (lastRecordedPath.current === pathname) {
      return;
    }

    lastRecordedPath.current = pathname;

    // Determine funnel stage from path or default to landing/general page
    const stage = PATH_STAGE_MAP[pathname] || "landing";

    // Small delay to allow localStorage or profile state to settle
    const timer = setTimeout(() => {
      recordFootprint(stage, { currentPath: pathname });
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

