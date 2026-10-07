"use client";

import { useTranslations } from "next-intl";
import { Languages, Palette } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export default function SettingsPage() {
  const t = useTranslations("Settings");

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" aria-hidden />
              {t("appearance")}
            </CardTitle>
            <CardDescription>{t("appearanceDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" aria-hidden />
              {t("language")}
            </CardTitle>
            <CardDescription>{t("languageDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LocaleSwitcher />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
