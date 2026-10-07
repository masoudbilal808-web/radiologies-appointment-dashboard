"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Tags,
  ScanLine,
  Building2,
  Handshake,
  Users,
  CalendarCheck,
  UserRound,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const mainNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/categories", labelKey: "categories", icon: Tags },
  { href: "/radiologies", labelKey: "radiologies", icon: ScanLine },
  { href: "/branches", labelKey: "branches", icon: Building2 },
  { href: "/partners", labelKey: "partners", icon: Handshake },
  { href: "/clients", labelKey: "clients", icon: Users },
  { href: "/reservations", labelKey: "reservations", icon: CalendarCheck },
];

export const secondaryNav: NavItem[] = [
  { href: "/profile", labelKey: "profile", icon: UserRound },
  { href: "/settings", labelKey: "settings", icon: Settings },
];
