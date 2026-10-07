"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
