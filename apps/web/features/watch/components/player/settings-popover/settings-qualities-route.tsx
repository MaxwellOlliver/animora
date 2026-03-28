"use client";

import { SettingsItem } from "./settings-item";
import { Check } from "lucide-react";
import { useSettingsRouter } from "./settings-router";
import { SettingsItemsGroup } from "./settings-items-group";
import { SettingsGroupHeader } from "./settings-group-header";

export function SettingsQualitiesRoute() {
  const { push } = useSettingsRouter();

  return (
    <SettingsItemsGroup className="w-56">
      <SettingsGroupHeader title="Quality" withGoBack />
      <SettingsItem
        icon={<Check />}
        label="1080p"
        onClick={() => push("qualities")}
      />
      <SettingsItem
        icon={<Check className="opacity-0" />}
        label="720p"
        onClick={() => push("qualities")}
      />
      <SettingsItem
        icon={<Check className="opacity-0" />}
        label="360p"
        onClick={() => push("qualities")}
      />
    </SettingsItemsGroup>
  );
}
