"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, Save, Trash2 } from "lucide-react";
import type { Category, Partner, ProfitShare } from "@/lib/api/types";
import { AppDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/ui/select";
import { FormField } from "@/components/ui/card";

interface ProfitShareRow {
  key: string;
  category: string;
  value: string;
}

export interface PartnerFormValues {
  name: string;
  profitShare: { category: string; value: number }[];
}

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  categories: Category[];
  initialValues?: Partner;
  onSubmit: (values: PartnerFormValues) => Promise<void>;
}

function rowKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function categoryIdOf(entry: ProfitShare): string {
  return typeof entry.category === "object" ? entry.category._id : entry.category;
}

export function PartnerFormDialog({
  open,
  onOpenChange,
  title,
  categories,
  initialValues,
  onSubmit,
}: PartnerFormDialogProps) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [rows, setRows] = useState<ProfitShareRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(initialValues?.name ?? "");
      setRows(
        (initialValues?.profitShare ?? []).map((entry) => ({
          key: rowKey(),
          category: categoryIdOf(entry),
          value: String(entry.value ?? ""),
        })),
      );
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
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t("Validation.required");

    const seen = new Set<string>();
    rows.forEach((row, index) => {
      if (!row.category) {
        next[`category-${index}`] = t("Validation.selectOption");
      } else if (seen.has(row.category)) {
        next[`category-${index}`] = t("Validation.duplicateCategory");
      } else {
        seen.add(row.category);
      }
      if (row.value === "" || Number.isNaN(Number(row.value))) {
        next[`value-${index}`] = t("Validation.invalidNumber");
      }
    });
    if (rows.length === 0) {
      next.profitShare = t("Validation.atLeastOneProfitShare");
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        profitShare: rows.map((row) => ({
          category: row.category,
          value: Number(row.value),
        })),
      });
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
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("Common.cancel")}
          </Button>
          <Button type="submit" form="partner-form" isLoading={isSubmitting}>
            {!isSubmitting ? <Save className="h-4 w-4" /> : null}
            {t("Common.save")}
          </Button>
        </>
      }
    >
      <form id="partner-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField id="partner-name" label={t("Partners.name")} required error={errors.name}>
          <Input
            id="partner-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("Partners.namePlaceholder")}
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold">{t("Partners.profitShare")}</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setRows((current) => [
                  ...current,
                  { key: rowKey(), category: "", value: "" },
                ])
              }
              disabled={categories.length === 0}
            >
              <Plus className="h-4 w-4" />
              {t("Partners.addEntry")}
            </Button>
          </div>
          {errors.profitShare ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.profitShare}
            </p>
          ) : null}
          {rows.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
              {t("Partners.noEntries")}
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid gap-3 rounded-md border border-border bg-muted/30 p-3 sm:grid-cols-[1fr_8rem_auto]"
                >
                  <FormField
                    id={`profit-category-${row.key}`}
                    label={t("Partners.category")}
                    required
                    error={errors[`category-${index}`]}
                  >
                    <AppSelect
                      options={categoryOptions}
                      value={row.category || null}
                      onValueChange={(value) =>
                        setRows((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, category: value } : item,
                          ),
                        )
                      }
                      placeholder={t("Radiologies.categoryPlaceholder")}
                    />
                  </FormField>
                  <FormField
                    id={`profit-value-${row.key}`}
                    label={t("Partners.value")}
                    required
                    error={errors[`value-${index}`]}
                  >
                    <Input
                      id={`profit-value-${row.key}`}
                      type="number"
                      min={0}
                      inputMode="decimal"
                      value={row.value}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, value: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </FormField>
                  <div className="flex items-end justify-end pb-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("Common.remove")}
                      onClick={() =>
                        setRows((current) => current.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </form>
    </AppDialog>
  );
}
