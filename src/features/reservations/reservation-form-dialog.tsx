"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import type { Branch, Partner, Radiology } from "@/lib/api/types";
import type { ReservationPayload } from "@/lib/api/reservations";
import { AppDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { AppSelect } from "@/components/ui/select";
import { FormField } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface ReservationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  radiologies: Radiology[];
  partners: Partner[];
  onSubmit: (values: ReservationPayload) => Promise<void>;
}

export function ReservationFormDialog({
  open,
  onOpenChange,
  branches,
  radiologies,
  partners,
  onSubmit,
}: ReservationFormDialogProps) {
  const t = useTranslations();
  const [date, setDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAge, setClientAge] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [partner, setPartner] = useState("");
  const [selectedRadiologies, setSelectedRadiologies] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDate("");
      setClientName("");
      setClientAge("");
      setClientPhone("");
      setBranch("");
      setPartner("");
      setSelectedRadiologies([]);
      setNotes("");
      setErrors({});
      setIsSubmitting(false);
    }
  }

  const branchOptions = branches.map((item) => ({
    value: item._id,
    label: item.name,
  }));
  const partnerOptions = partners.map((item) => ({
    value: item._id,
    label: item.name,
  }));

  function toggleRadiology(id: string) {
    setSelectedRadiologies((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!date) next.date = t("Validation.required");
    if (!branch) next.branch = t("Validation.selectOption");
    if (selectedRadiologies.length === 0) {
      next.radiologies = t("Validation.atLeastOneRadiology");
    }
    if (!partner) next.partner = t("Validation.selectOption");
    if (!clientName.trim()) next.clientName = t("Validation.required");
    if (!clientAge.trim() || Number.isNaN(Number(clientAge)) || Number(clientAge) <= 0) {
      next.clientAge = t("Validation.invalidNumber");
    }
    if (!clientPhone.trim()) next.clientPhone = t("Validation.required");

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const iso = new Date(date).toISOString();
    setIsSubmitting(true);
    try {
      await onSubmit({
        date: iso,
        notes: notes.trim() || undefined,
        branch,
        radiologies: selectedRadiologies,
        fromPartner: partner,
        clientName: clientName.trim(),
        clientAge: Number(clientAge),
        clientPhone: clientPhone.trim(),
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
      title={t("Reservations.createTitle")}
      description={t("Reservations.createDescription")}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("Common.cancel")}
          </Button>
          <Button type="submit" form="reservation-form" isLoading={isSubmitting}>
            {!isSubmitting ? <Save className="h-4 w-4" /> : null}
            {t("Reservations.create")}
          </Button>
        </>
      }
    >
      <form id="reservation-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="reservation-date"
            label={t("Reservations.date")}
            required
            error={errors.date}
          >
            <Input
              id="reservation-date"
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={Boolean(errors.date)}
            />
          </FormField>

          <FormField
            id="reservation-client-name"
            label={t("Reservations.clientName")}
            required
            error={errors.clientName}
          >
            <Input
              id="reservation-client-name"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder={t("Reservations.clientNamePlaceholder")}
              aria-invalid={Boolean(errors.clientName)}
            />
          </FormField>

          <FormField
            id="reservation-client-age"
            label={t("Reservations.clientAge")}
            required
            error={errors.clientAge}
          >
            <Input
              id="reservation-client-age"
              type="number"
              min={1}
              inputMode="numeric"
              value={clientAge}
              onChange={(event) => setClientAge(event.target.value)}
              aria-invalid={Boolean(errors.clientAge)}
            />
          </FormField>

          <FormField
            id="reservation-client-phone"
            label={t("Reservations.clientPhone")}
            required
            error={errors.clientPhone}
          >
            <Input
              id="reservation-client-phone"
              type="tel"
              dir="ltr"
              value={clientPhone}
              onChange={(event) => setClientPhone(event.target.value)}
              placeholder={t("Reservations.clientPhonePlaceholder")}
              aria-invalid={Boolean(errors.clientPhone)}
            />
          </FormField>

          <FormField
            id="reservation-branch"
            label={t("Reservations.branch")}
            required
            error={errors.branch}
          >
            <AppSelect
              options={branchOptions}
              value={branch || null}
              onValueChange={setBranch}
              placeholder={t("Reservations.branchPlaceholder")}
              ariaLabel={t("Reservations.branch")}
              disabled={branches.length === 0}
            />
          </FormField>

          <FormField
            id="reservation-partner"
            label={t("Reservations.partner")}
            required
            error={errors.partner}
          >
            <AppSelect
              options={partnerOptions}
              value={partner || null}
              onValueChange={setPartner}
              placeholder={t("Reservations.partnerPlaceholder")}
              ariaLabel={t("Reservations.partner")}
              disabled={partners.length === 0}
            />
          </FormField>
        </div>

        <FormField
          id="reservation-radiologies"
          label={t("Reservations.radiologies")}
          required
          error={errors.radiologies}
          hint={radiologies.length === 0 ? t("Radiologies.emptyTitle") : undefined}
        >
          <div
            className={cn(
              "grid max-h-44 gap-2 overflow-y-auto rounded-md border border-input bg-card p-3 sm:grid-cols-2",
              errors.radiologies && "border-destructive",
            )}
            role="group"
            aria-label={t("Reservations.radiologies")}
          >
            {radiologies.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">
                {t("Radiologies.emptyTitle")}
              </p>
            ) : (
              radiologies.map((radiology) => {
                const checked = selectedRadiologies.includes(radiology._id);
                const categoryName =
                  typeof radiology.category === "object"
                    ? radiology.category.name
                    : "";
                return (
                  <label
                    key={radiology._id}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-md border border-border p-2 text-sm transition-colors hover:bg-muted/60",
                      checked && "border-primary/50 bg-primary/5",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRadiology(radiology._id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {radiology.name}
                      </span>
                      {categoryName ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {categoryName}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </FormField>

        <FormField id="reservation-notes" label={t("Reservations.notes")}>
          <Textarea
            id="reservation-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={t("Reservations.notesPlaceholder")}
            rows={2}
          />
        </FormField>
      </form>
    </AppDialog>
  );
}
