"use client";

import { SettingsItem } from "./item";
import { Check } from "lucide-react";
import { SettingsItemsGroup } from "./items-group";
import { SettingsGroupHeader } from "./group-header";
import { useVideoQualityOptions } from "@vidstack/react";
import { usePlayerContext } from "../player-context";

export function SettingsQualitiesRoute() {
  const options = useVideoQualityOptions({ auto: true, sort: "descending" });
  const { closeSettings } = usePlayerContext();

  return (
    <SettingsItemsGroup className="w-56">
      <SettingsGroupHeader title="Quality" withGoBack />
      {options.map((option) => {
        const isAuto = !option.quality;
        const isChecked = isAuto
          ? option.selected
          : option.selected && !option.autoSelected;

        return (
          <SettingsItem
            key={option.value}
            icon={
              <Check className={isChecked ? "" : "opacity-0"} />
            }
            label={
              isAuto
                ? `Auto${options.selectedQuality ? ` (${options.selectedQuality.height}p)` : ""}`
                : `${option.quality.height}p`
            }
            onClick={() => { option.select(); closeSettings(); }}
          />
        );
      })}
    </SettingsItemsGroup>
  );
}
