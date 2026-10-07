"use client";

import { Pagination } from "@ark-ui/react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AppPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AppPagination({
  page,
  pageCount,
  onPageChange,
  className,
}: AppPaginationProps) {
  const t = useTranslations("Table");
  if (pageCount <= 1) return null;

  return (
    <Pagination.Root
      count={pageCount}
      page={page}
      onPageChange={(details) => onPageChange(details.page)}
      pageSize={1}
      siblingCount={1}
      className={cn("flex items-center justify-between gap-3", className)}
    >
      <Pagination.Context>
        {(pagination) => (
          <div className="flex items-center gap-1">
            <Pagination.PrevTrigger
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              aria-label={t("previousPage")}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{t("previousPage")}</span>
            </Pagination.PrevTrigger>
            <div className="flex items-center gap-1">
              {pagination.pages.map((paginationPage, index) =>
                paginationPage.type === "page" ? (
                  <Pagination.Item
                    key={paginationPage.value}
                    type="page"
                    value={paginationPage.value}
                    className={cn(
                      "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors",
                      paginationPage.value === pagination.page
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {paginationPage.value}
                  </Pagination.Item>
                ) : (
                  <Pagination.Ellipsis
                    key={`ellipsis-${index}`}
                    index={index}
                    className="px-1 text-sm text-muted-foreground"
                  >
                    …
                  </Pagination.Ellipsis>
                ),
              )}
            </div>
            <Pagination.NextTrigger
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              aria-label={t("nextPage")}
            >
              <span className="hidden sm:inline">{t("nextPage")}</span>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Pagination.NextTrigger>
          </div>
        )}
      </Pagination.Context>
    </Pagination.Root>
  );
}
