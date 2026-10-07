"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Handshake,
  ScanLine,
  Tags,
  Timer,
  UserRound,
  XCircle,
} from "lucide-react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { getCategories } from "@/lib/api/categories";
import { getRadiologies } from "@/lib/api/radiologies";
import { getBranches } from "@/lib/api/branches";
import { getPartners } from "@/lib/api/partners";
import { getClients } from "@/lib/api/clients";
import { getReservations } from "@/lib/api/reservations";
import type {
  Branch,
  Category,
  Client,
  Partner,
  Radiology,
  Reservation,
} from "@/lib/api/types";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { CardsSkeleton, SectionSkeleton } from "@/components/shared/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ReservationStateBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/utils/format";
import { useLocale } from "next-intl";

interface DashboardData {
  categories: Category[];
  radiologies: Radiology[];
  branches: Branch[];
  partners: Partner[];
  clients: Client[];
  reservations: Reservation[];
}

async function fetchDashboardData(): Promise<DashboardData> {
  const [categories, radiologies, branches, partners, clients, reservations] =
    await Promise.all([
      getCategories(),
      getRadiologies(),
      getBranches(),
      getPartners(),
      getClients(),
      getReservations(),
    ]);
  return { categories, radiologies, branches, partners, clients, reservations };
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const { data, error, isLoading, refetch } = useApiQuery(fetchDashboardData, []);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("description")} />
        <CardsSkeleton count={6} />
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionSkeleton className="h-40 lg:col-span-1" />
          <SectionSkeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("description")} />
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  const pending = data.reservations.filter((r) => r.state === "pending");
  const complete = data.reservations.filter((r) => r.state === "complete");
  const missed = data.reservations.filter((r) => r.state === "missed");

  const recent = [...data.reservations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const stats = [
    { label: t("totalCategories"), value: data.categories.length, icon: Tags },
    { label: t("totalRadiologies"), value: data.radiologies.length, icon: ScanLine },
    { label: t("totalBranches"), value: data.branches.length, icon: Building2 },
    { label: t("totalPartners"), value: data.partners.length, icon: Handshake },
    { label: t("totalClients"), value: data.clients.length, icon: UserRound },
    { label: t("totalReservations"), value: data.reservations.length, icon: CalendarCheck },
  ];

  const stateCards = [
    { label: t("pendingReservations"), value: pending.length, icon: Timer, className: "text-amber-600 dark:text-amber-400" },
    { label: t("completedReservations"), value: complete.length, icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
    { label: t("missedReservations"), value: missed.length, icon: XCircle, className: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stateCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${stat.className}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{t("recentReservations")}</CardTitle>
          <Link
            href="/reservations"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <EmptyState
              title={t("emptyReservationsTitle")}
              description={t("emptyReservationsDescription")}
              icon={<CalendarClock className="h-6 w-6" />}
            />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((reservation) => {
                const clientName =
                  typeof reservation.client === "object"
                    ? reservation.client.name
                    : "—";
                const branchName =
                  typeof reservation.branch === "object"
                    ? reservation.branch.name
                    : "—";
                return (
                  <li
                    key={reservation._id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{clientName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {branchName} · {formatDateTime(reservation.date, locale)}
                      </p>
                    </div>
                    <ReservationStateBadge state={reservation.state} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
