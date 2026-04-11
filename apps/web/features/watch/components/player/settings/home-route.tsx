"use client";

import { useMediaState } from "@vidstack/react";
import { ChevronRight, Play, SkipForward, Video } from "lucide-react";

import { Switch } from "@/components/ui/switch";

import { updateSettings, usePlayerSettings } from "../player-store";
import { SettingsGroupHeader } from "./group-header";
import { SettingsItem } from "./item";
import { SettingsItemsGroup } from "./items-group";
import { useSettingsRouter } from "./router";

export function SettingsHomeRoute() {
  const { push } = useSettingsRouter();
  const { autoPlay, autoSkip } = usePlayerSettings();
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
        icon={<Play />}
        label="Auto play"
        onClick={() => updateSettings({ autoPlay: !autoPlay })}
        subComponent={
          <Switch
            checked={autoPlay}
            onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
            onClick={(e) => e.stopPropagation()}
          />
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
