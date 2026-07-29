"use client";

import { Popover } from "@base-ui-components/react/popover";
import { ChevronDownIcon, XIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type MultiSelectOption = { id: string; label: string };

interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  }

  const selectedOptions = options.filter((o) => selected.includes(o.id));

  return (
    <div className="flex flex-col gap-2">
      <Popover.Root>
        <Popover.Trigger
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {label}
          {selected.length > 0 && (
            <span className="rounded-full bg-primary/20 px-1.5 text-xs text-foreground">
              {selected.length}
            </span>
          )}
          <ChevronDownIcon className="size-4" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner className="z-100" sideOffset={4}>
            <Popover.Popup className="flex max-h-72 w-56 flex-col gap-1 overflow-y-auto rounded-lg border border-border bg-elevated p-2 shadow-lg">
              {options.length === 0 ? (
                <p className="p-2 text-xs text-foreground-muted">
                  No options available
                </p>
              ) : (
                options.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground-muted hover:bg-foreground/10 hover:text-foreground"
                  >
                    <Checkbox
                      checked={selected.includes(option.id)}
                      onCheckedChange={() => toggle(option.id)}
                    />
                    {option.label}
                  </label>
                ))
              )}
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="mt-1 rounded-md px-2 py-1.5 text-left text-xs text-foreground-muted hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="flex items-center gap-1 rounded-full bg-foreground/10 py-1 pl-2.5 pr-1.5 text-xs text-foreground"
            >
              {option.label}
              <button
                type="button"
                onClick={() => toggle(option.id)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <XIcon className="size-3" />
                <span className="sr-only">Remove {option.label}</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
