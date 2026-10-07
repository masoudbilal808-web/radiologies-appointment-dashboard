"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { AppMenu, AppMenuItem } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function LocaleSwitcher() {
  const t = useTranslations("Language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <AppMenu
      trigger={
        <Button variant="ghost" size="icon" aria-label={t("label")}>
          <Languages className="h-4 w-4" />
        </Button>
      }
    >
      {routing.locales.map((item) => (
        <AppMenuItem key={item} onSelect={() => switchLocale(item)}>
          <span className={cn("w-4 text-center", item === locale && "font-bold")}>
            {item === "en" ? "EN" : "ع"}
          </span>
          {localeLabels[item]}
        </AppMenuItem>
      ))}
    </AppMenu>
  );
}
