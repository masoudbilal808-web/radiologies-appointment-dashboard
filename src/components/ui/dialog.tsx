"use client";

import type { ReactNode } from "react";
import { Dialog } from "@ark-ui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: AppDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(details) => onOpenChange(details.open)}>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] data-[state=open]:animate-in" />
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
        <Dialog.Content
          className={cn(
            "w-full max-w-lg rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl",
            "max-h-[calc(100vh-2rem)] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.CloseTrigger
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.CloseTrigger>
          </div>
          {children}
          {footer ? (
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
