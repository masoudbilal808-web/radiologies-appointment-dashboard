"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "./badge";
import type { ReservationState } from "@/lib/api/types";

const variantByState: Record<ReservationState, BadgeVariant> = {
  pending: "warning",
  complete: "success",
  missed: "destructive",
};

export function ReservationStateBadge({
  state,
}: {
  state: ReservationState;
}) {
  const t = useTranslations("States");
  return <Badge variant={variantByState[state]}>{t(state)}</Badge>;
}
