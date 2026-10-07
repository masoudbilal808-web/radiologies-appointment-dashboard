"use client";

import { Select, createListCollection } from "@ark-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  options: SelectOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function AppSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  disabled,
  className,
  ariaLabel,
}: AppSelectProps) {
  const collection = createListCollection({
    items: options,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  return (
    <Select.Root
      collection={collection}
      value={value != null ? [value] : undefined}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next != null) onValueChange(next);
      }}
      positioning={{ sameWidth: true }}
      disabled={disabled}
    >
      <Select.Control className={className}>
        <Select.Trigger
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
            "data-[state=open]:border-ring disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label={ariaLabel}
        >
          <Select.ValueText
            placeholder={placeholder}
            className="truncate text-start"
          />
          <Select.Indicator>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner className="z-50">
        <Select.Content
          className={cn(
            "max-h-64 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
          )}
        >
          {options.map((option) => (
            <Select.Item
              key={option.value}
              item={option}
              className={cn(
                "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                "data-[state=checked]:font-medium",
              )}
            >
              <Select.ItemText className="truncate">
                {option.label}
              </Select.ItemText>
              <Select.ItemIndicator className="ms-auto">
                <Check className="h-4 w-4 text-primary" />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}
