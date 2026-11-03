"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global client application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-2xl shadow-xs">
            BMY<span className="text-emerald-500">FIT</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Ready to continue?
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              We encountered a temporary connection issue. Your calculations and measurements are safely preserved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer"
            >
              Refresh Application
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition inline-flex items-center justify-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
