"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck, Plus } from "lucide-react";
import {
  createReservation,
  getReservations,
  updateReservationState,
} from "@/lib/api/reservations";
import {
  fetchCachedBranches,
  fetchCachedPartners,
  fetchCachedRadiologies,
  invalidateReferenceCache,
} from "@/lib/api/reference-cache";
import {
  isPopulatedBranch,
  isPopulatedClient,
  isPopulatedPartner,
  isPopulatedRadiology,
  type Branch,
  type Partner,
  type Radiology,
  type Reservation,
  type ReservationState,
} from "@/lib/api/types";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, resolveErrorMessage } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { AppSelect } from "@/components/ui/select";
import { AppMenu, AppMenuItem } from "@/components/ui/menu";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationStateBadge } from "@/components/ui/status-badge";
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
import { useToast } from "@/components/ui/toast";
import { ReservationFormDialog } from "./reservation-form-dialog";
import { formatDateTime } from "@/lib/utils/format";
import { PAGE_SIZE } from "@/lib/utils/constants";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils/cn";

interface ReservationsData {
  reservations: Reservation[];
  branches: Branch[];
  radiologies: Radiology[];
  partners: Partner[];
}

async function fetchData(): Promise<ReservationsData> {
  const [reservations, branches, radiologies, partners] = await Promise.all([
    getReservations(),
    fetchCachedBranches(),
    fetchCachedRadiologies(),
    fetchCachedPartners(),
  ]);
  return { reservations, branches, radiologies, partners };
}

function clientNameOf(reservation: Reservation): string {
  if (isPopulatedClient(reservation.client)) return reservation.client.name;
  return "—";
}

function clientPhoneOf(reservation: Reservation): string {
  if (isPopulatedClient(reservation.client)) return reservation.client.phoneNumber;
  return "—";
}

function branchNameOf(reservation: Reservation): string {
  if (isPopulatedBranch(reservation.branch)) return reservation.branch.name;
  return "—";
}

function partnerNameOf(reservation: Reservation): string {
  if (isPopulatedPartner(reservation.fromPartner)) {
    return reservation.fromPartner.name;
  }
  return "—";
}

function radiologyNamesOf(reservation: Reservation): string[] {
  return reservation.radiologies.map((item) =>
    isPopulatedRadiology(item) ? item.name : "—",
  );
}

export function ReservationsView() {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const { data, error, isLoading, refetch } = useApiQuery(fetchData, []);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const reservations = useMemo(() => data?.reservations ?? [], [data]);
  const branches = useMemo(() => data?.branches ?? [], [data]);
  const radiologies = useMemo(() => data?.radiologies ?? [], [data]);
  const partners = useMemo(() => data?.partners ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reservations
      .filter((item) => {
        const matchesState =
          stateFilter === "all" || item.state === stateFilter;
        if (!matchesState) return false;
        if (!query) return true;
        return (
          clientNameOf(item).toLowerCase().includes(query) ||
          clientPhoneOf(item).toLowerCase().includes(query) ||
          branchNameOf(item).toLowerCase().includes(query) ||
          partnerNameOf(item).toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reservations, search, stateFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleCreate(values: Parameters<typeof createReservation>[0]) {
    try {
      await createReservation(values);
      invalidateReferenceCache();
      toast.success(t("Toasts.created"));
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  async function handleStateChange(
    reservation: Reservation,
    state: ReservationState,
  ) {
    if (reservation.state === state) return;
    setUpdatingId(reservation._id);
    try {
      await updateReservationState(reservation._id, state);
      toast.success(t("Toasts.stateUpdated"), t(`States.${state}`));
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
    } finally {
      setUpdatingId(null);
    }
  }

  const stateOptions = [
    { value: "all", label: t("Reservations.allStates") },
    { value: "pending", label: t("States.pending") },
    { value: "complete", label: t("States.complete") },
    { value: "missed", label: t("States.missed") },
  ];

  const stateActions: ReservationState[] = ["pending", "complete", "missed"];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("Reservations.title")}
        description={t("Reservations.description")}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("Reservations.create")}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("Reservations.searchPlaceholder")}
        />
        <div className="w-full sm:w-44">
          <AppSelect
            options={stateOptions}
            value={stateFilter}
            onValueChange={(value) => {
              setStateFilter(value);
              setPage(1);
            }}
            ariaLabel={t("Reservations.filterByState")}
          />
        </div>
        {filtered.length > 0 ? (
          <p className="text-sm text-muted-foreground sm:ms-auto">
            {t("Table.itemCount", { count: filtered.length })}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRetry} />
      ) : reservations.length === 0 ? (
        <EmptyState
          title={t("Reservations.emptyTitle")}
          description={t("Reservations.emptyDescription")}
          icon={<CalendarCheck className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("Reservations.create")}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title={t("Table.noResults")} description={t("Table.noResultsDescription")} />
      ) : (
        <>
          <div className="hidden md:block">
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Reservations.client")}</TableHead>
                    <TableHead>{t("Reservations.phone")}</TableHead>
                    <TableHead>{t("Reservations.date")}</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      {t("Reservations.branch")}
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      {t("Reservations.radiologies")}
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      {t("Reservations.partner")}
                    </TableHead>
                    <TableHead>{t("Reservations.state")}</TableHead>
                    <TableHead className="w-14 text-end">
                      {t("Common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((reservation) => {
                    const radiologyNames = radiologyNamesOf(reservation);
                    const isUpdating = updatingId === reservation._id;
                    return (
                      <TableRow key={reservation._id} data-state={isUpdating ? "selected" : undefined}>
                        <TableCell className="font-medium">
                          {clientNameOf(reservation)}
                        </TableCell>
                        <TableCell>
                          <span dir="ltr" className="text-muted-foreground">
                            {clientPhoneOf(reservation)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDateTime(reservation.date, locale)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {branchNameOf(reservation)}
                        </TableCell>
                        <TableCell className="hidden max-w-40 lg:table-cell">
                          <span className="block truncate text-muted-foreground">
                            {radiologyNames.join(", ") || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {partnerNameOf(reservation)}
                        </TableCell>
                        <TableCell>
                          <ReservationStateBadge state={reservation.state} />
                        </TableCell>
                        <TableCell className="text-end">
                          <div
                            className={cn(
                              "flex justify-end",
                              isUpdating && "opacity-60",
                            )}
                          >
                            <AppMenu
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isUpdating}
                                  aria-label={t("Reservations.changeState")}
                                >
                                  {t("Reservations.changeState")}
                                </Button>
                              }
                            >
                              {stateActions.map((state) => (
                                <AppMenuItem
                                  key={state}
                                  onSelect={() => handleStateChange(reservation, state)}
                                  disabled={reservation.state === state}
                                >
                                  <ReservationStateBadge state={state} />
                                </AppMenuItem>
                              ))}
                            </AppMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableWrapper>
          </div>

          <div className="space-y-3 md:hidden">
            {pageItems.map((reservation) => {
              const radiologyNames = radiologyNamesOf(reservation);
              const isUpdating = updatingId === reservation._id;
              return (
                <Card key={reservation._id} className={cn(isUpdating && "opacity-60")}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {clientNameOf(reservation)}
                        </p>
                        <p className="truncate text-sm text-muted-foreground" dir="ltr">
                          {clientPhoneOf(reservation)}
                        </p>
                      </div>
                      <ReservationStateBadge state={reservation.state} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("Reservations.date")}
                        </p>
                        <p className="text-sm">{formatDateTime(reservation.date, locale)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("Reservations.branch")}
                        </p>
                        <p className="truncate text-sm">{branchNameOf(reservation)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">
                          {t("Reservations.radiologies")}
                        </p>
                        <p className="text-sm">
                          {radiologyNames.join(", ") || "—"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">
                          {t("Reservations.partner")}
                        </p>
                        <p className="text-sm">{partnerNameOf(reservation)}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <AppMenu
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            aria-label={t("Reservations.changeState")}
                          >
                            {t("Reservations.changeState")}
                          </Button>
                        }
                      >
                        {stateActions.map((state) => (
                          <AppMenuItem
                            key={state}
                            onSelect={() => handleStateChange(reservation, state)}
                            disabled={reservation.state === state}
                          >
                            <ReservationStateBadge state={state} />
                          </AppMenuItem>
                        ))}
                      </AppMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <AppPagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}

      <ReservationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        branches={branches}
        radiologies={radiologies}
        partners={partners}
        onSubmit={handleCreate}
      />
    </div>
  );
}
