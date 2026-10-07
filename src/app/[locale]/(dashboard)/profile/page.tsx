"use client";

import { useTranslations } from "next-intl";
import { UserRound } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} description={t("description")} />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{t("accountInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-medium">{user?.username ?? "—"}</p>
              <Badge variant="secondary" className="mt-1">
                {t("admin")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
