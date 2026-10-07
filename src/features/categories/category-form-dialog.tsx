"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { AppDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/card";
import { Save } from "lucide-react";

export interface CategoryFormValues {
  name: string;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  onSubmit,
}: CategoryFormDialogProps) {
  const t = useTranslations();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setName(initialValues?.name ?? "");
    setError(null);
    setIsSubmitting(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("Validation.required"));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmed });
      onOpenChange(false);
      reset();
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title={title}
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("Common.cancel")}
          </Button>
          <Button type="submit" form="category-form" isLoading={isSubmitting}>
            {!isSubmitting ? <Save className="h-4 w-4" /> : null}
            {t("Common.save")}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="category-name" label={t("Categories.name")} required error={error ?? undefined}>
          <Input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("Categories.namePlaceholder")}
            aria-invalid={Boolean(error)}
            autoFocus
          />
        </FormField>
      </form>
    </AppDialog>
  );
}
