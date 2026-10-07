"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, mapApiErrorToKey } from "@/lib/api/errors";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function resolveErrorMessage(error: unknown, t: (key: string) => string): string {
  const key = mapApiErrorToKey(error);
  if (key) return t(`ApiErrors.${key}`);
  const fallback = getApiErrorMessage(error);
  if (fallback === "networkError") return t("ApiErrors.networkError");
  if (fallback === "genericError") return t("ApiErrors.genericError");
  if (error instanceof Error && error.message && !error.message.startsWith("Request failed")) {
    return error.message;
  }
  return t("ApiErrors.genericError");
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const t = useTranslations();
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {t("Errors.title")}
        </p>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {resolveErrorMessage(error, (key) => t(key))}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="h-4 w-4" />
          {t("Errors.retry")}
        </Button>
      ) : null}
    </div>
  );
}
