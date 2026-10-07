"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, Save, Trash2 } from "lucide-react";
import type {
  Branch,
  Radiology,
  WorkScheduleEntry,
} from "@/lib/api/types";
import { AppDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { AppSelect } from "@/components/ui/select";
import { FormField } from "@/components/ui/card";
import {
  minutesToTimeInput,
  timeInputToMinutes,
} from "@/lib/utils/format";

interface RadiologyRow {
  key: string;
  radiology: string;
  price: string;
  salePrice: string;
}

interface ScheduleRow {
  key: string;
  weekday: string;
  openTime: string;
  closeTime: string;
}

export interface BranchFormValues {
  name: string;
  address: string;
  availableRadiology: {
    radiology: string;
    price: number;
    salePrice: number;
  }[];
  workSchedule: WorkScheduleEntry[];
}

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  radiologies: Radiology[];
  initialValues?: Branch;
  onSubmit: (values: BranchFormValues) => Promise<void>;
}

function createRowKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildInitialRows(branch?: Branch): {
  radiologyRows: RadiologyRow[];
  scheduleRows: ScheduleRow[];
} {
  if (!branch) {
    return { radiologyRows: [], scheduleRows: [] };
  }
  return {
    radiologyRows: branch.availableRadiology.map((entry) => {
      const radiologyId =
        typeof entry.radiology === "object" ? entry.radiology._id : entry.radiology;
      return {
        key: createRowKey(),
        radiology: radiologyId,
        price: String(entry.price ?? ""),
        salePrice: String(entry.salePrice ?? ""),
      };
    }),
    scheduleRows: branch.workSchedule.map((entry) => ({
      key: createRowKey(),
      weekday: String(entry.weekday),
      openTime: minutesToTimeInput(entry.openTime),
      closeTime: minutesToTimeInput(entry.closeTime),
    })),
  };
}

export function BranchFormDialog({
  open,
  onOpenChange,
  title,
  radiologies,
  initialValues,
  onSubmit,
}: BranchFormDialogProps) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [radiologyRows, setRadiologyRows] = useState<RadiologyRow[]>([]);
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(initialValues?.name ?? "");
      setAddress(initialValues?.address ?? "");
      const built = buildInitialRows(initialValues);
      setRadiologyRows(built.radiologyRows);
      setScheduleRows(built.scheduleRows);
      setErrors({});
      setIsSubmitting(false);
    }
  }

  const radiologyOptions = radiologies.map((item) => ({
    value: item._id,
    label: item.name,
  }));

  const weekdayOptions = Array.from({ length: 7 }, (_, index) => ({
    value: String(index),
    label: t(`Weekdays.${index}`),
  }));

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next.name = t("Validation.minChars", { min: 3 });
    if (address.trim().length < 3) next.address = t("Validation.minChars", { min: 3 });
    radiologyRows.forEach((row, index) => {
      if (!row.radiology) {
        next[`radiology-${index}`] = t("Validation.selectOption");
      }
      if (row.price === "" || Number.isNaN(Number(row.price)) || Number(row.price) < 0) {
        next[`price-${index}`] = t("Validation.invalidNumber");
      }
      if (
        row.salePrice !== "" &&
        (Number.isNaN(Number(row.salePrice)) || Number(row.salePrice) < 0)
      ) {
        next[`salePrice-${index}`] = t("Validation.invalidNumber");
      }
    });
    scheduleRows.forEach((row, index) => {
      if (row.weekday === "") {
        next[`weekday-${index}`] = t("Validation.selectOption");
      }
      if (!row.openTime) next[`open-${index}`] = t("Validation.required");
      if (!row.closeTime) next[`close-${index}`] = t("Validation.required");
    });
    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        availableRadiology: radiologyRows.map((row) => ({
          radiology: row.radiology,
          price: Number(row.price),
          salePrice: row.salePrice === "" ? Number(row.price) : Number(row.salePrice),
        })),
        workSchedule: scheduleRows.map((row) => ({
          weekday: Number(row.weekday),
          openTime: timeInputToMinutes(row.openTime),
          closeTime: timeInputToMinutes(row.closeTime),
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
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("Common.cancel")}
          </Button>
          <Button type="submit" form="branch-form" isLoading={isSubmitting}>
            {!isSubmitting ? <Save className="h-4 w-4" /> : null}
            {t("Common.save")}
          </Button>
        </>
      }
    >
      <form id="branch-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="branch-name"
            label={t("Branches.name")}
            required
            error={errors.name}
          >
            <Input
              id="branch-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("Branches.namePlaceholder")}
              aria-invalid={Boolean(errors.name)}
            />
          </FormField>
          <FormField
            id="branch-address"
            label={t("Branches.address")}
            required
            error={errors.address}
            className="sm:col-span-2"
          >
            <Textarea
              id="branch-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={t("Branches.addressPlaceholder")}
              aria-invalid={Boolean(errors.address)}
              rows={2}
            />
          </FormField>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold">{t("Branches.availableRadiologies")}</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setRadiologyRows((rows) => [
                  ...rows,
                  { key: createRowKey(), radiology: "", price: "", salePrice: "" },
                ])
              }
              disabled={radiologies.length === 0}
            >
              <Plus className="h-4 w-4" />
              {t("Branches.addRadiology")}
            </Button>
          </div>
          {radiologies.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t("Radiologies.emptyTitle")}
            </p>
          ) : null}
          {radiologyRows.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
              {t("Branches.noRadiologyRows")}
            </p>
          ) : (
            <div className="space-y-3">
              {radiologyRows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid gap-3 rounded-md border border-border bg-muted/30 p-3 sm:grid-cols-[1fr_7rem_7rem_auto]"
                >
                  <FormField
                    id={`radiology-${row.key}`}
                    label={t("Branches.radiology")}
                    required
                    error={errors[`radiology-${index}`]}
                  >
                    <AppSelect
                      options={radiologyOptions}
                      value={row.radiology || null}
                      onValueChange={(value) =>
                        setRadiologyRows((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, radiology: value } : item,
                          ),
                        )
                      }
                      placeholder={t("Radiologies.categoryPlaceholder")}
                    />
                  </FormField>
                  <FormField
                    id={`price-${row.key}`}
                    label={t("Branches.price")}
                    required
                    error={errors[`price-${index}`]}
                  >
                    <Input
                      id={`price-${row.key}`}
                      type="number"
                      min={0}
                      inputMode="decimal"
                      value={row.price}
                      onChange={(event) =>
                        setRadiologyRows((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, price: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </FormField>
                  <FormField
                    id={`sale-${row.key}`}
                    label={t("Branches.salePrice")}
                    error={errors[`salePrice-${index}`]}
                  >
                    <Input
                      id={`sale-${row.key}`}
                      type="number"
                      min={0}
                      inputMode="decimal"
                      value={row.salePrice}
                      onChange={(event) =>
                        setRadiologyRows((rows) =>
                          rows.map((item, i) =>
                            i === index
                              ? { ...item, salePrice: event.target.value }
                              : item,
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
                        setRadiologyRows((rows) => rows.filter((_, i) => i !== index))
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

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold">{t("Branches.workSchedule")}</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setScheduleRows((rows) => [
                  ...rows,
                  {
                    key: createRowKey(),
                    weekday: "0",
                    openTime: "09:00",
                    closeTime: "17:00",
                  },
                ])
              }
            >
              <Plus className="h-4 w-4" />
              {t("Branches.addSchedule")}
            </Button>
          </div>
          {scheduleRows.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
              {t("Branches.noScheduleRows")}
            </p>
          ) : (
            <div className="space-y-3">
              {scheduleRows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid gap-3 rounded-md border border-border bg-muted/30 p-3 sm:grid-cols-[1fr_7rem_7rem_auto]"
                >
                  <FormField
                    id={`weekday-${row.key}`}
                    label={t("Branches.weekday")}
                    required
                    error={errors[`weekday-${index}`]}
                  >
                    <AppSelect
                      options={weekdayOptions}
                      value={row.weekday}
                      onValueChange={(value) =>
                        setScheduleRows((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, weekday: value } : item,
                          ),
                        )
                      }
                    />
                  </FormField>
                  <FormField
                    id={`open-${row.key}`}
                    label={t("Branches.openTime")}
                    required
                    error={errors[`open-${index}`]}
                  >
                    <Input
                      id={`open-${row.key}`}
                      type="time"
                      value={row.openTime}
                      onChange={(event) =>
                        setScheduleRows((rows) =>
                          rows.map((item, i) =>
                            i === index
                              ? { ...item, openTime: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </FormField>
                  <FormField
                    id={`close-${row.key}`}
                    label={t("Branches.closeTime")}
                    required
                    error={errors[`close-${index}`]}
                  >
                    <Input
                      id={`close-${row.key}`}
                      type="time"
                      value={row.closeTime}
                      onChange={(event) =>
                        setScheduleRows((rows) =>
                          rows.map((item, i) =>
                            i === index
                              ? { ...item, closeTime: event.target.value }
                              : item,
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
                        setScheduleRows((rows) => rows.filter((_, i) => i !== index))
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
