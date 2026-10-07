"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, CalendarCheck, Phone, UserRound } from "lucide-react";
import { getClients } from "@/lib/api/clients";
import type { Client } from "@/lib/api/types";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { SectionSkeleton } from "@/components/shared/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReservationStateBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/utils/format";
import { useLocale } from "next-intl";

export function ClientDetailsView({ clientId }: { clientId: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const { data, error, isLoading, refetch } = useApiQuery(getClients, [clientId]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const client: Client | null = useMemo(() => {
    if (!data) return null;
    return data.find((item) => item._id === clientId) ?? null;
  }, [data, clientId]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SectionSkeleton className="h-24" />
        <SectionSkeleton className="h-72" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-5">
        <BackLink />
        <ErrorState
          error={error ?? new Error(t("ApiErrors.notFound"))}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const reservations = [...(client.reservations ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-5">
      <BackLink />
      <PageHeader
        title={client.name}
        description={t("Clients.detailsDescription")}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{t("Clients.age")}</p>
              <p className="text-lg font-semibold">{client.age}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{t("Clients.phone")}</p>
              <p className="truncate text-lg font-semibold" dir="ltr">
                {client.phoneNumber}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarCheck className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("Clients.reservationCount")}
              </p>
              <p className="text-lg font-semibold">{reservations.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Clients.reservationsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reservations.length === 0 ? (
            <EmptyState title={t("Dashboard.emptyReservationsTitle")} />
          ) : (
            <ul className="divide-y divide-border">
              {reservations.map((reservation) => {
                const branchName =
                  typeof reservation.branch === "object"
                    ? reservation.branch.name
                    : "—";
                return (
                  <li
                    key={reservation._id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {formatDateTime(reservation.date, locale)}
                      </p>
                      <p className="text-xs text-muted-foreground">{branchName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ReservationStateBadge state={reservation.state} />
                      <Badge variant="outline">{reservation.radiologies.length}</Badge>
                    </div>
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

function BackLink() {
  const t = useTranslations("Common");
  return (
    <Link
      href="/clients"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
      {t("backToList")}
    </Link>
  );
}
