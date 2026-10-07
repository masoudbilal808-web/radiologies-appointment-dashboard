"use client";

import type { ReactNode } from "react";
import { Drawer } from "@ark-ui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "next-intl";

interface AppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: "start" | "end";
}

export function AppDrawer({
  open,
  onOpenChange,
  title,
  children,
  side = "start",
}: AppDrawerProps) {
  const locale = useLocale();
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      swipeDirection={side}
    >
      <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/55" />
      <Drawer.Positioner className="fixed inset-0 z-50">
        <Drawer.Content
          className={cn(
            "absolute inset-y-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-border bg-sidebar shadow-xl",
            side === "start" && locale !== "ar"
              ? "inset-s-0 border-e"
              : "inset-e-0 border-s",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Drawer.Title className="text-sm font-semibold text-sidebar-foreground">
              {title}
            </Drawer.Title>
            <Drawer.CloseTrigger
              className="rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Drawer.CloseTrigger>
          </div>
          <div className="flex-1 overflow-y-auto p-3">{children}</div>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
