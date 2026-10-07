"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenMobileNav: () => void;
  pageTitle?: string;
}

export function Header({ onOpenMobileNav, pageTitle }: HeaderProps) {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label={t("openMenu")}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        {pageTitle ? (
          <p className="truncate text-sm font-medium text-muted-foreground">
            {pageTitle}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        <LocaleSwitcher />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
