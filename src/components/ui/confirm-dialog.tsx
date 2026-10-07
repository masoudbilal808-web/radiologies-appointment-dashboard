"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AppDialog } from "./dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("Confirm");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setIsSubmitting(false);
    onOpenChange(next);
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title ?? t("deleteTitle")}
      description={description ?? t("deleteDescription")}
      className="max-w-md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            isLoading={isSubmitting}
          >
            {!isSubmitting ? <AlertTriangle className="h-4 w-4" /> : null}
            {confirmLabel ?? t("confirmDelete")}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <p className="text-muted-foreground">{t("warning")}</p>
      </div>
      {isSubmitting ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("deleting")}
        </div>
      ) : null}
    </AppDialog>
  );
}
