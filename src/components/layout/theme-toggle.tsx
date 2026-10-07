"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { AppMenu, AppMenuItem } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label={t("label")} disabled>
        <SunMoon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <AppMenu
      trigger={
        <Button variant="ghost" size="icon" aria-label={t("label")}>
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <SunMoon className="h-4 w-4" />
          )}
        </Button>
      }
    >
      <AppMenuItem onSelect={() => setTheme("light")}>
        <Sun className="h-4 w-4" />
        {t("light")}
      </AppMenuItem>
      <AppMenuItem onSelect={() => setTheme("dark")}>
        <Moon className="h-4 w-4" />
        {t("dark")}
      </AppMenuItem>
      <AppMenuItem onSelect={() => setTheme("system")}>
        <SunMoon className="h-4 w-4" />
        {t("system")}
      </AppMenuItem>
    </AppMenu>
  );
}
