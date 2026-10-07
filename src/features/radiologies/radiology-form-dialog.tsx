"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { AppDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/ui/select";
import { FormField } from "@/components/ui/card";

export interface RadiologyFormValues {
  name: string;
  category: string;
}

interface RadiologyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  categories: Category[];
  initialValues?: RadiologyFormValues;
  onSubmit: (values: RadiologyFormValues) => Promise<void>;
}

export function RadiologyFormDialog({
  open,
  onOpenChange,
  title,
  categories,
  initialValues,
  onSubmit,
}: RadiologyFormDialogProps) {
  const t = useTranslations();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(initialValues?.name ?? "");
      setCategory(initialValues?.category ?? "");
      setErrors({});
      setIsSubmitting(false);
    }
  }

  const categoryOptions = categories.map((item) => ({
    value: item._id,
    label: item.name,
  }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: { name?: string; category?: string } = {};
    if (!name.trim()) next.name = t("Validation.required");
    if (!category) next.category = t("Validation.selectOption");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), category });
      onOpenChange(false);
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
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
          <Button type="submit" form="radiology-form" isLoading={isSubmitting}>
            {!isSubmitting ? <Save className="h-4 w-4" /> : null}
            {t("Common.save")}
          </Button>
        </>
      }
    >
      <form
        id="radiology-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <FormField
          id="radiology-name"
          label={t("Radiologies.name")}
          required
          error={errors.name}
        >
          <Input
            id="radiology-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("Radiologies.namePlaceholder")}
            aria-invalid={Boolean(errors.name)}
            autoFocus
          />
        </FormField>
        <FormField
          id="radiology-category"
          label={t("Radiologies.category")}
          required
          error={errors.category}
          hint={
            categories.length === 0 ? t("Radiologies.noCategories") : undefined
          }
        >
          <AppSelect
            options={categoryOptions}
            value={category || null}
            onValueChange={setCategory}
            placeholder={t("Radiologies.categoryPlaceholder")}
            ariaLabel={t("Radiologies.category")}
            disabled={categories.length === 0}
          />
        </FormField>
      </form>
    </AppDialog>
  );
}
