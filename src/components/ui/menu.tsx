"use client";

import { useId, type ReactNode } from "react";
import { Menu } from "@ark-ui/react/menu";
import { cn } from "@/lib/utils/cn";

interface AppMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function AppMenu({
  trigger,
  children,
  align = "end",
  className,
}: AppMenuProps) {
  // const id = useId();
  return (
    <Menu.Root positioning={{ placement: `bottom-${align}`, gutter: 8 }}>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Positioner className="z-50">
        <Menu.Content
          // id={`${id}-content`}
          className={cn(
            "min-w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-0",
            className,
          )}
        >
          {children}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}

interface AppMenuItemProps {
  onSelect: () => void;
  children: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  value?: string;
}

export function AppMenuItem({
  onSelect,
  children,
  destructive,
  disabled,
  value,
}: AppMenuItemProps) {
  const generated = useId();
  return (
    <Menu.Item
      value={value ?? generated}
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        destructive && "text-destructive data-[highlighted]:bg-destructive/10",
      )}
    >
      {children}
    </Menu.Item>
  );
}

export function AppMenuSeparator() {
  return <Menu.Separator className="my-1 h-px bg-border" />;
}
