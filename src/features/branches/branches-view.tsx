"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { createBranch, deleteBranch, getBranches, updateBranch } from "@/lib/api/branches";
import {
  fetchCachedRadiologies,
  invalidateReferenceCache,
} from "@/lib/api/reference-cache";
import type { Branch, Radiology } from "@/lib/api/types";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, resolveErrorMessage } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AppMenu, AppMenuItem } from "@/components/ui/menu";
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
import { useRouter } from "@/i18n/navigation";
import { BranchFormDialog, type BranchFormValues } from "./branch-form-dialog";
import { PAGE_SIZE } from "@/lib/utils/constants";

interface BranchesData {
  branches: Branch[];
  radiologies: Radiology[];
}

async function fetchData(): Promise<BranchesData> {
  const [branches, radiologies] = await Promise.all([
    getBranches(),
    fetchCachedRadiologies(),
  ]);
  return { branches, radiologies };
}

export function BranchesView() {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();
  const { data, error, isLoading, refetch } = useApiQuery(fetchData, []);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState<Branch | null>(null);

  const branches = useMemo(() => data?.branches ?? [], [data]);
  const radiologies = useMemo(() => data?.radiologies ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return branches;
    return branches.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query),
    );
  }, [branches, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleCreate(values: BranchFormValues) {
    try {
      await createBranch(values);
      invalidateReferenceCache();
      toast.success(t("Toasts.created"));
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  async function handleUpdate(values: BranchFormValues) {
    if (!editing) return;
    try {
      const updated = await updateBranch(editing._id, values);
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
    if (!deleting) return;
    try {
      await deleteBranch(deleting._id);
      invalidateReferenceCache();
      toast.success(t("Toasts.deleted"));
      setDeleting(null);
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("Branches.title")}
        description={t("Branches.description")}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("Branches.create")}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("Branches.searchPlaceholder")}
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
      ) : branches.length === 0 ? (
        <EmptyState
          title={t("Branches.emptyTitle")}
          description={t("Branches.emptyDescription")}
          icon={<Building2 className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("Branches.create")}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title={t("Table.noResults")} description={t("Table.noResultsDescription")} />
      ) : (
        <>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Branches.name")}</TableHead>
                  <TableHead>{t("Branches.address")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("Branches.availableCount")}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("Branches.reservationsCount")}
                  </TableHead>
                  <TableHead className="w-16 text-end">{t("Common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((branch) => (
                  <TableRow key={branch._id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell className="max-w-56">
                      <span className="flex items-start gap-1.5 text-muted-foreground">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="line-clamp-2">{branch.address}</span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {branch.availableRadiology?.length ?? 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {branch.reservations?.length ?? 0}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end">
                        <AppMenu
                          trigger={
                            <Button variant="ghost" size="icon" aria-label={t("Common.actions")}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <AppMenuItem onSelect={() => router.push(`/branches/${branch._id}`)}>
                            <Eye className="h-4 w-4" />
                            {t("Common.viewDetails")}
                          </AppMenuItem>
                          <AppMenuItem onSelect={() => setEditing(branch)}>
                            <Pencil className="h-4 w-4" />
                            {t("Common.edit")}
                          </AppMenuItem>
                          <AppMenuItem onSelect={() => setDeleting(branch)} destructive>
                            <Trash2 className="h-4 w-4" />
                            {t("Common.delete")}
                          </AppMenuItem>
                        </AppMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
          <AppPagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}

      <BranchFormDialog
        key="create-branch"
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("Branches.createTitle")}
        radiologies={radiologies}
        onSubmit={handleCreate}
      />
      <BranchFormDialog
        key={`edit-branch-${editing?._id ?? "none"}`}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={t("Branches.editTitle")}
        radiologies={radiologies}
        initialValues={editing ?? undefined}
        onSubmit={handleUpdate}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        description={
          deleting
            ? t("Branches.deleteDescription", { name: deleting.name })
            : undefined
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
