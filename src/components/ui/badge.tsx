"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary/10 text-primary",
  secondary: "border-transparent bg-muted text-muted-foreground",
  outline: "border-border text-foreground",
  success: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400",
  destructive:
    "border-transparent bg-destructive/10 text-destructive dark:text-red-400",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
