"use client";

import { useState, useCallback } from "react";
import type { RazorpayOptions } from "@/types/payment";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        setIsLoaded(true);
        resolve(true);
        return;
      }

      setIsLoading(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
        resolve(true);
      };

      script.onerror = () => {
        setIsLoading(false);
        setLoadError("Failed to load Razorpay payment gateway script");
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }, []);

  const openCheckout = useCallback(
    async (options: RazorpayOptions): Promise<void> => {
      const loaded = await loadScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Unable to open Razorpay checkout modal.");
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    [loadScript],
  );

  return {
    isLoaded,
    isLoading,
    loadError,
    loadScript,
    openCheckout,
  };
}
