"use client";

import type { ReactNode } from "react";

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border bg-muted/50 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, index) => (
            <div key={index} className="h-3 flex-1 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-3 py-4">
            {Array.from({ length: cols }).map((__, colIndex) => (
              <div
                key={colIndex}
                className="h-4 flex-1 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-lg border border-border bg-card"
        />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="h-32 animate-pulse rounded-lg border border-border bg-card" />
  );
}

export function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg border border-border bg-card ${className ?? "h-40"}`} />
  );
}

export function InlineSkeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? "h-4 w-24"}`} />;
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

export { type ReactNode };
