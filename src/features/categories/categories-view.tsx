"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api/categories";
import type { Category } from "@/lib/api/types";
import { invalidateReferenceCache } from "@/lib/api/reference-cache";
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
import { CategoryFormDialog } from "./category-form-dialog";
import { formatDate } from "@/lib/utils/format";
import { useLocale } from "next-intl";
import { PAGE_SIZE } from "@/lib/utils/constants";

export function CategoriesView() {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const { data, error, isLoading, refetch } = useApiQuery(getCategories, []);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    const items = data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [data, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleCreate(values: { name: string }) {
    try {
      await createCategory(values.name);
      invalidateReferenceCache();
      toast.success(t("Toasts.created"));
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  async function handleUpdate(values: { name: string }) {
    if (!editing) return;
    try {
      const updated = await updateCategory(editing._id, values.name);
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
      await deleteCategory(deleting._id);
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
        title={t("Categories.title")}
        description={t("Categories.description")}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("Categories.create")}
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
          placeholder={t("Categories.searchPlaceholder")}
        />
        {filtered.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("Table.itemCount", { count: filtered.length })}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRetry} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title={t("Categories.emptyTitle")}
          description={t("Categories.emptyDescription")}
          icon={<Tags className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("Categories.create")}
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
                  <TableHead>{t("Categories.name")}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("Common.createdAt")}
                  </TableHead>
                  <TableHead className="w-16 text-end">
                    {t("Common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(category.createdAt, locale)}
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
                          <AppMenuItem onSelect={() => setEditing(category)}>
                            <Pencil className="h-4 w-4" />
                            {t("Common.edit")}
                          </AppMenuItem>
                          <AppMenuItem onSelect={() => setDeleting(category)} destructive>
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
          <AppPagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </>
      )}

      <CategoryFormDialog
        key="create-category"
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("Categories.createTitle")}
        onSubmit={handleCreate}
      />
      <CategoryFormDialog
        key={`edit-category-${editing?._id ?? "none"}`}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={t("Categories.editTitle")}
        initialValues={editing ? { name: editing.name } : undefined}
        onSubmit={handleUpdate}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        description={
          deleting
            ? t("Categories.deleteDescription", { name: deleting.name })
            : undefined
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
