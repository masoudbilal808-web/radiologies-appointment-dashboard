"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Pencil, Plus, ScanLine, Trash2 } from "lucide-react";
import {
  createRadiology,
  deleteRadiology,
  getRadiologies,
  updateRadiology,
} from "@/lib/api/radiologies";
import {
  fetchCachedCategories,
  invalidateReferenceCache,
} from "@/lib/api/reference-cache";
import {
  isPopulatedCategory,
  type Category,
  type Radiology,
} from "@/lib/api/types";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, resolveErrorMessage } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AppMenu, AppMenuItem } from "@/components/ui/menu";
import { AppSelect } from "@/components/ui/select";
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
import { useToast } from "@/components/ui/toast";
import { RadiologyFormDialog } from "./radiology-form-dialog";
import { PAGE_SIZE } from "@/lib/utils/constants";

interface RadiologiesData {
  radiologies: Radiology[];
  categories: Category[];
}

async function fetchData(): Promise<RadiologiesData> {
  const [radiologies, categories] = await Promise.all([
    getRadiologies(),
    fetchCachedCategories(),
  ]);
  return { radiologies, categories };
}

function categoryName(radiology: Radiology): string {
  if (isPopulatedCategory(radiology.category)) return radiology.category.name;
  return "—";
}

function categoryId(radiology: Radiology): string {
  if (isPopulatedCategory(radiology.category)) return radiology.category._id;
  return radiology.category;
}

export function RadiologiesView() {
  const t = useTranslations();
  const toast = useToast();
  const { data, error, isLoading, refetch } = useApiQuery(fetchData, []);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Radiology | null>(null);
  const [deleting, setDeleting] = useState<Radiology | null>(null);

  const categories = useMemo(() => data?.categories ?? [], [data]);
  const radiologies = useMemo(() => data?.radiologies ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return radiologies.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        categoryName(item).toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" || categoryId(item) === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [radiologies, search, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleCreate(values: { name: string; category: string }) {
    try {
      await createRadiology(values);
      toast.success(t("Toasts.created"));
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  async function handleUpdate(values: { name: string; category: string }) {
    if (!editing) return;
    try {
      const updated = await updateRadiology(editing._id, values);
      if (!updated) {
        toast.error(t("Toasts.error"), t("ApiErrors.notFound"));
        return;
      }
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
      await deleteRadiology(deleting._id);
      invalidateReferenceCache();
      toast.success(t("Toasts.deleted"));
      setDeleting(null);
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  const categoryOptions = [
    { value: "all", label: t("Radiologies.allCategories") },
    ...categories.map((item) => ({ value: item._id, label: item.name })),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("Radiologies.title")}
        description={t("Radiologies.description")}
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={categories.length === 0}>
            <Plus className="h-4 w-4" />
            {t("Radiologies.create")}
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
          placeholder={t("Radiologies.searchPlaceholder")}
        />
        <div className="w-full sm:w-52">
          <AppSelect
            options={categoryOptions}
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            ariaLabel={t("Radiologies.filterByCategory")}
          />
        </div>
        {filtered.length > 0 ? (
          <p className="text-sm text-muted-foreground sm:ms-auto">
            {t("Table.itemCount", { count: filtered.length })}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRetry} />
      ) : radiologies.length === 0 ? (
        <EmptyState
          title={t("Radiologies.emptyTitle")}
          description={t("Radiologies.emptyDescription")}
          icon={<ScanLine className="h-6 w-6" />}
          action={
            categories.length > 0 ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("Radiologies.create")}
              </Button>
            ) : undefined
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("Table.noResults")}
          description={t("Table.noResultsDescription")}
        />
      ) : (
        <>
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Radiologies.name")}</TableHead>
                  <TableHead>{t("Radiologies.category")}</TableHead>
                  <TableHead className="w-16 text-end">
                    {t("Common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((radiology) => (
                  <TableRow key={radiology._id}>
                    <TableCell className="font-medium">{radiology.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{categoryName(radiology)}</Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end">
                        <AppMenu
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("Common.actions")}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <AppMenuItem onSelect={() => setEditing(radiology)}>
                            <Pencil className="h-4 w-4" />
                            {t("Common.edit")}
                          </AppMenuItem>
                          <AppMenuItem
                            onSelect={() => setDeleting(radiology)}
                            destructive
                          >
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

      <RadiologyFormDialog
        key="create-radiology"
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("Radiologies.createTitle")}
        categories={categories}
        onSubmit={handleCreate}
      />
      <RadiologyFormDialog
        key={`edit-radiology-${editing?._id ?? "none"}`}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={t("Radiologies.editTitle")}
        categories={categories}
        initialValues={
          editing
            ? { name: editing.name, category: categoryId(editing) }
            : undefined
        }
        onSubmit={handleUpdate}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        description={
          deleting
            ? t("Radiologies.deleteDescription", { name: deleting.name })
            : undefined
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
