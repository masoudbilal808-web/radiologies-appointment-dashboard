"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Handshake, MoreHorizontal, Pencil, Percent, Plus, Trash2 } from "lucide-react";
import { createPartner, deletePartner, getPartners, updatePartner } from "@/lib/api/partners";
import {
  fetchCachedCategories,
  invalidateReferenceCache,
} from "@/lib/api/reference-cache";
import {
  isPopulatedCategory,
  type Category,
  type Partner,
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
import { PartnerFormDialog, type PartnerFormValues } from "./partner-form-dialog";
import { PAGE_SIZE } from "@/lib/utils/constants";

interface PartnersData {
  partners: Partner[];
  categories: Category[];
}

async function fetchData(): Promise<PartnersData> {
  const [partners, categories] = await Promise.all([
    getPartners(),
    fetchCachedCategories(),
  ]);
  return { partners, categories };
}

export function PartnersView() {
  const t = useTranslations();
  const toast = useToast();
  const { data, error, isLoading, refetch } = useApiQuery(fetchData, []);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState<Partner | null>(null);

  const partners = useMemo(() => data?.partners ?? [], [data]);
  const categories = useMemo(() => data?.categories ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return partners;
    return partners.filter((item) => item.name.toLowerCase().includes(query));
  }, [partners, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  function categoryName(id: string): string {
    const match = categories.find((item) => item._id === id);
    return match?.name ?? "—";
  }

  function summarizeProfitShare(partner: Partner): string {
    if (partner.profitShare.length === 0) return "—";
    return partner.profitShare
      .map((entry) => {
        const cat = isPopulatedCategory(entry.category)
          ? entry.category.name
          : categoryName(entry.category);
        return `${cat}: ${entry.value}%`;
      })
      .join(" · ");
  }

  async function handleCreate(values: PartnerFormValues) {
    try {
      await createPartner(values);
      invalidateReferenceCache();
      toast.success(t("Toasts.created"));
      await refetch();
    } catch (err) {
      toast.error(t("Toasts.error"), resolveErrorMessage(err, (k) => t(k)));
      throw err;
    }
  }

  async function handleUpdate(values: PartnerFormValues) {
    if (!editing) return;
    try {
      const updated = await updatePartner(editing._id, values);
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
      await deletePartner(deleting._id);
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
        title={t("Partners.title")}
        description={t("Partners.description")}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("Partners.create")}
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
          placeholder={t("Partners.searchPlaceholder")}
        />
        {filtered.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("Table.itemCount", { count: filtered.length })}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRetry} />
      ) : partners.length === 0 ? (
        <EmptyState
          title={t("Partners.emptyTitle")}
          description={t("Partners.emptyDescription")}
          icon={<Handshake className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("Partners.create")}
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
                  <TableHead>{t("Partners.name")}</TableHead>
                  <TableHead>{t("Partners.profitShare")}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("Partners.entryCount")}
                  </TableHead>
                  <TableHead className="w-16 text-end">{t("Common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((partner) => (
                  <TableRow key={partner._id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell className="max-w-md text-muted-foreground">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Percent className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                        {summarizeProfitShare(partner)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{partner.profitShare.length}</Badge>
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
                          <AppMenuItem onSelect={() => setEditing(partner)}>
                            <Pencil className="h-4 w-4" />
                            {t("Common.edit")}
                          </AppMenuItem>
                          <AppMenuItem onSelect={() => setDeleting(partner)} destructive>
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

      <PartnerFormDialog
        key="create-partner"
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("Partners.createTitle")}
        categories={categories}
        onSubmit={handleCreate}
      />
      <PartnerFormDialog
        key={`edit-partner-${editing?._id ?? "none"}`}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={t("Partners.editTitle")}
        categories={categories}
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
            ? t("Partners.deleteDescription", { name: deleting.name })
            : undefined
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
