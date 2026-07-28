"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
} from "@/components/ui/select";

import {
  buildSeasonOptions,
  getSeasonLabel,
  type SeasonName,
} from "../utils/season";

type SelectOption = { label: string; value: string };

function toValue(year: number, season: SeasonName): string {
  return `${year}-${season}`;
}

interface SeasonPickerProps {
  year: number;
  season: SeasonName;
}

export function SeasonPicker({ year, season }: SeasonPickerProps) {
  const router = useRouter();

  const items = useMemo<SelectOption[]>(
    () =>
      buildSeasonOptions().map((option) => ({
        label: getSeasonLabel(option.year, option.season),
        value: toValue(option.year, option.season),
      })),
    [],
  );

  const activeItem =
    items.find((item) => item.value === toValue(year, season)) ?? items[0];

  return (
    <Select
      value={activeItem}
      onValueChange={(item) => {
        if (!item) return;
        const [nextYear, nextSeason] = item.value.split("-");
        router.push(`/season?year=${nextYear}&season=${nextSeason}`);
      }}
      items={items}
    >
      <SelectTrigger />
      <SelectPopup>
        {items.map((item) => (
          <SelectItem key={item.value} value={item}>
            {item.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
