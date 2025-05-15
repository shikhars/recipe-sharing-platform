import React from "react";

/**
 * Skeleton: A simple animated loading placeholder.
 * @param className - Custom classes for size/shape
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
  );
} 