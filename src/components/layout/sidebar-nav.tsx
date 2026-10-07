"use client";

import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { mainNav, secondaryNav, type NavItem } from "./nav-config";

function NavList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  const t = useTranslations("Nav");
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Activity className="h-4 w-4" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold leading-tight text-foreground">
          {t("brand")}
        </span>
        <span className="text-[11px] leading-tight text-muted-foreground">
          {t("tagline")}
        </span>
      </span>
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("Nav");
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="px-1 pt-1">
        <Brand />
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("menu")}
          </p>
          <NavList items={mainNav} onNavigate={onNavigate} />
        </div>
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("account")}
          </p>
          <NavList items={secondaryNav} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
