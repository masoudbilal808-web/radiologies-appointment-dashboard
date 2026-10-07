"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, Phone, UserRound, Users } from "lucide-react";
import { getClients } from "@/lib/api/clients";
import type { Client } from "@/lib/api/types";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/components/ui/table";
import { AppPagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils/format";
import { PAGE_SIZE } from "@/lib/utils/constants";
import { useLocale } from "next-intl";

function latestReservationDate(client: Client): string | null {
  if (!client.reservations || client.reservations.length === 0) return null;
  const timestamps = client.reservations.map((reservation) =>
    new Date(reservation.date).getTime(),
  );
  const max = Math.max(...timestamps.filter((value) => !Number.isNaN(value)));
  return Number.isNaN(max) ? null : new Date(max).toISOString();
}

export function ClientsView() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { data, error, isLoading, refetch } = useApiQuery(getClients, []);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const clients = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.phoneNumber.toLowerCase().includes(query),
    );
  }, [clients, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("Clients.title")} description={t("Clients.description")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("Clients.searchPlaceholder")}
        />
        {filtered.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("Table.itemCount", { count: filtered.length })}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRetry} />
      ) : clients.length === 0 ? (
        <EmptyState
          title={t("Clients.emptyTitle")}
          description={t("Clients.emptyDescription")}
          icon={<Users className="h-6 w-6" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title={t("Table.noResults")} description={t("Table.noResultsDescription")} />
      ) : (
        <>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Clients.name")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("Clients.age")}</TableHead>
                  <TableHead>{t("Clients.phone")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("Clients.reservationCount")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("Clients.latestReservation")}
                  </TableHead>
                  <TableHead className="w-16 text-end">{t("Common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((client) => {
                  const latest = latestReservationDate(client);
                  return (
                    <TableRow key={client._id}>
                      <TableCell>
                        <span className="flex items-center gap-2 font-medium">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                            <UserRound className="h-3.5 w-3.5" aria-hidden />
                          </span>
                          {client.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{client.age}</TableCell>
                      <TableCell>
                        <span
                          className="flex items-center gap-1.5 text-muted-foreground"
                          dir="ltr"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          {client.phoneNumber}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{client.reservations?.length ?? 0}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {latest ? formatDate(latest, locale) : "—"}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("Common.viewDetails")}
                          onClick={() => router.push(`/clients/${client._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
          <AppPagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
