"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "@/components/ui/icons";

interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Admin Console Boundary Caught Error:", error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-slate-50/50">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-rose-200/80 shadow-xl p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                Coach Console Protected
              </span>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">
                {this.props.fallbackTitle || "Admin Module Interrupted"}
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                A localized rendering issue was isolated safely. Other admin tools and your coach session remain active and intact.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800">
                <span className="text-rose-400 font-bold block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                {this.state.errorInfo && (
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap leading-tight">
                    {this.state.errorInfo.slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Admin Console</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Hard Refresh</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
