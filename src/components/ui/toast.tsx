"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createToaster, Toast, Toaster } from "@ark-ui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastType = "success" | "error" | "info" | "loading";

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

const toaster = createToaster({
  placement: "bottom-end",
  duration: 4000,
  offsets: { top: "1.25rem", bottom: "1.25rem", left: "1.25rem", right: "1.25rem" },
});

interface ToastContextValue {
  create: (options: ToastOptions) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const typeClasses: Record<ToastType, string> = {
  success: "border-emerald-500/40",
  error: "border-destructive/40",
  info: "border-primary/40",
  loading: "border-border",
};

const typeDotClasses: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-destructive",
  info: "bg-primary",
  loading: "bg-muted-foreground",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ToastContextValue>(
    () => ({
      create: ({ title, description, type = "info", duration }) => {
        toaster.create({
          title,
          description,
          type: type === "loading" ? "loading" : type,
          duration,
        });
      },
      success: (title, description) => {
        toaster.create({ title, description, type: "success", duration: 3500 });
      },
      error: (title, description) => {
        toaster.create({ title, description, type: "error", duration: 5000 });
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root
            className={cn(
              "pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border bg-card p-4 shadow-lg",
              typeClasses[toast.type as ToastType] ?? "border-border",
            )}
          >
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                typeDotClasses[toast.type as ToastType] ?? "bg-primary",
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-1">
              <Toast.Title className="text-sm font-semibold text-foreground">
                {toast.title}
              </Toast.Title>
              {toast.description ? (
                <Toast.Description className="text-sm text-muted-foreground">
                  {toast.description}
                </Toast.Description>
              ) : null}
            </div>
            <Toast.CloseTrigger
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
