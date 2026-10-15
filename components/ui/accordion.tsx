"use client";

import React, { useState } from "react";

export interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-surface-200 dark:border-surface-800 py-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between text-left font-semibold text-ink dark:text-white transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1"
      >
        <span>{title}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-ink-muted dark:text-surface-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pt-2 pb-1 text-sm text-ink-muted dark:text-surface-300 leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export function Accordion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full divide-y divide-surface-200 dark:divide-surface-800 ${className}`}>{children}</div>;
}
