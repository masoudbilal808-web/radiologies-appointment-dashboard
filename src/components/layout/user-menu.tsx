"use client";

import { useTranslations } from "next-intl";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { useRouter } from "@/i18n/navigation";
import { AppMenu, AppMenuSeparator, AppMenuItem } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const t = useTranslations("Nav");
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <AppMenu
      trigger={
        <Button
          variant="ghost"
          className="h-9 gap-2 px-2"
          aria-label={t("accountMenu")}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initial}
          </span>
          <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
            {user.username}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      }
    >
      <div className="px-2 py-1.5">
        <p className="truncate text-sm font-medium">{user.username}</p>
        <p className="truncate text-xs text-muted-foreground">{t("signedInAs")}</p>
      </div>
      <AppMenuSeparator />
      <AppMenuItem onSelect={() => router.push("/profile")}>
        <UserRound className="h-4 w-4" />
        {t("profile")}
      </AppMenuItem>
      <AppMenuItem onSelect={() => router.push("/settings")}>
        <Settings className="h-4 w-4" />
        {t("settings")}
      </AppMenuItem>
      <AppMenuSeparator />
      <AppMenuItem onSelect={logout} destructive>
        <LogOut className="h-4 w-4" />
        {t("logout")}
      </AppMenuItem>
    </AppMenu>
  );
}
