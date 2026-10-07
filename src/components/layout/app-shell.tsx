"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Header } from "./header";
import { SidebarNav } from "./sidebar-nav";
import { AppDrawer } from "@/components/ui/drawer";

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations("Nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e border-sidebar-border bg-sidebar lg:block">
        <div className="h-full p-4">
          <SidebarNav />
        </div>
      </aside>

      <AppDrawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title={t("menu")}
        side="start"
      >
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </AppDrawer>

      <div className="lg:ps-64">
        <Header onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="mx-auto w-full container px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
