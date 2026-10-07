"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarCheck,
  Pencil,
  ScanLine,
  Trash2,
} from "lucide-react";
import { deleteBranch, getBranch, updateBranch } from "@/lib/api/branches";
import {
  fetchCachedRadiologies,
  invalidateReferenceCache,
} from "@/lib/api/reference-cache";
import {
  isPopulatedRadiology,
  type Branch,
  type Radiology,
} from "@/lib/api/types";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, resolveErrorMessage } from "@/components/shared/error-state";
import { SectionSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Link, useRouter } from "@/i18n/navigation";
import { formatDate, formatTimeFromMinutes } from "@/lib/utils/format";
import { BranchFormDialog, type BranchFormValues } from "./branch-form-dialog";
import { useLocale } from "next-intl";

interface BranchDetailsData {
  branch: Branch;
  radiologies: Radiology[];
}

async function fetchBranchData(id: string): Promise<BranchDetailsData> {
  const [branch, radiologies] = await Promise.all([
    getBranch(id),
    fetchCachedRadiologies(),
  ]);
  return { branch, radiologies };
}

export function BranchDetailsView({ branchId }: { branchId: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const router = useRouter();
  const { data, error, isLoading, refetch } = useApiQuery(
    () => fetchBranchData(branchId),
    [branchId],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleUpdate(values: BranchFormValues) {
    try {
      const updated = await updateBranch(branchId, values);
      if (!updated) {
        toast.error(t("Toasts.error"), t("ApiErrors.notFound"));
        return;
      }
      invalidateReferenceCache();
      toast.success(t("Toasts.updated"));
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  async function handleDelete() {
    try {
      await deleteBranch(branchId);
      invalidateReferenceCache();
      toast.success(t("Toasts.deleted"));
      router.push("/branches");
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SectionSkeleton className="h-24" />
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionSkeleton className="h-64" />
          <SectionSkeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-5">
        <BackLink />
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  const { branch, radiologies } = data;

  return (
    <div className="space-y-5">
      <BackLink />
      <PageHeader
        title={branch.name}
        description={branch.address}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {t("Common.edit")}
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t("Common.delete")}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" />
              {t("Branches.availableRadiologies")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {branch.availableRadiology.length === 0 ? (
              <EmptyState
                title={t("Branches.noRadiologyRows")}
                className="py-8"
              />
            ) : (
              <TableWrapper className="rounded-none border-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Radiologies.name")}</TableHead>
                      <TableHead className="text-end">{t("Branches.price")}</TableHead>
                      <TableHead className="text-end">
                        {t("Branches.salePrice")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branch.availableRadiology.map((entry, index) => {
                      const radiology = entry.radiology;
                      const label = isPopulatedRadiology(radiology)
                        ? radiology.name
                        : radiologies.find((r) => r._id === radiology)?.name ?? "—";
                      return (
                        <TableRow key={`${entry.price}-${index}`}>
                          <TableCell className="font-medium">{label}</TableCell>
                          <TableCell className="text-end">{entry.price}</TableCell>
                          <TableCell className="text-end">
                            {entry.salePrice ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableWrapper>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Branches.workSchedule")}</CardTitle>
            </CardHeader>
            <CardContent>
              {branch.workSchedule.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("Branches.noScheduleRows")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {branch.workSchedule.map((entry, index) => (
                    <li
                      key={`${entry.weekday}-${index}`}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{t(`Weekdays.${entry.weekday}`)}</span>
                      <span className="text-muted-foreground">
                        {formatTimeFromMinutes(entry.openTime)} –{" "}
                        {formatTimeFromMinutes(entry.closeTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                {t("Branches.reservations")}
              </CardTitle>
              <Badge variant="secondary">{branch.reservations.length}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {branch.reservations.length === 0 ? (
                <EmptyState title={t("Dashboard.emptyReservationsTitle")} className="py-8" />
              ) : (
                <ul className="divide-y divide-border">
                  {branch.reservations.map((item) => {
                    if (typeof item === "string") {
                      return null;
                    }
                    const clientName =
                      typeof item.client === "object" ? item.client.name : "—";
                    return (
                      <li
                        key={item._id}
                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{clientName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {formatDate(item.date, locale)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.state === "complete"
                              ? "success"
                              : item.state === "pending"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {t(`States.${item.state}`)}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BranchFormDialog
        key={`edit-branch-details-${branch._id}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t("Branches.editTitle")}
        radiologies={radiologies}
        initialValues={branch}
        onSubmit={handleUpdate}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        description={t("Branches.deleteDescription", { name: branch.name })}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function BackLink() {
  const t = useTranslations("Common");
  return (
    <Link
      href="/branches"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
      {t("backToList")}
    </Link>
  );
}
