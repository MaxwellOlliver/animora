"use client";

import { SettingsItem } from "./settings-item";
import { ChevronRight, SkipForward, Video } from "lucide-react";
import { useSettingsRouter } from "./settings-router";
import { SettingsItemsGroup } from "./settings-items-group";
import { Switch } from "@/app/components/ui/switch";
import { SettingsGroupHeader } from "./settings-group-header";
import { updateSettings, usePlayerSettings } from "../player-store";
import { useMediaState } from "@vidstack/react";

export function SettingsHomeRoute() {
  const { push } = useSettingsRouter();
  const { autoSkip } = usePlayerSettings();
  const quality = useMediaState("quality");

  return (
    <SettingsItemsGroup className="w-72">
      <SettingsGroupHeader title="Settings" />
      <SettingsItem
        icon={<Video />}
        label="Quality"
        onClick={() => push("qualities")}
        subComponent={
          <div className="flex items-center gap-1">
            <span className="text-sm text-foreground-muted">
              {quality ? `${quality.height}p` : "Auto"}
            </span>
            <ChevronRight className="size-4" />
          </div>
        }
      />
      <SettingsItem
        icon={<SkipForward />}
        label="Auto skip"
        onClick={() => updateSettings({ autoSkip: !autoSkip })}
        subComponent={
          <Switch
            checked={autoSkip}
            onCheckedChange={(checked) => updateSettings({ autoSkip: checked })}
            onClick={(e) => e.stopPropagation()}
          />
        }
      />
    </SettingsItemsGroup>
  );
}
