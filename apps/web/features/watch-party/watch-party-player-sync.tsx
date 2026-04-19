"use client";

import { useMediaPlayer, useMediaState } from "@vidstack/react";
import { useEffect, useRef } from "react";

import { useWatchParty } from "./watch-party-context";

const DRIFT_IGNORE_MS = 300;
const DRIFT_HARD_SEEK_MS = 2000;
const RECONCILE_INTERVAL_MS = 2000;

export function WatchPartyPlayerSync() {
  const wp = useWatchParty();
  const player = useMediaPlayer();
  const paused = useMediaState("paused");
  const seeking = useMediaState("seeking");
  const canPlay = useMediaState("canPlay");

  const applyingRemoteRef = useRef(false);
  const hasSyncedRef = useRef(false);
  const lastLocalSeekAtRef = useRef(0);

  useEffect(() => {
    if (!wp || !player) return;

    const unsubscribe = wp.onRemotePlayback((broadcast) => {
      if (broadcast.actorProfileId === wp.selfProfileId) return;

      applyingRemoteRef.current = true;
      const targetSeconds = broadcast.position / 1000;

      if (Math.abs(player.currentTime - targetSeconds) > 0.3) {
        player.currentTime = targetSeconds;
      }
      if (broadcast.playing) {
        void player.play();
      } else {
        player.pause();
      }

      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 100);
    });

    return unsubscribe;
  }, [wp, player]);

  useEffect(() => {
    if (!wp || !player) return;
    if (hasSyncedRef.current) return;
    if (!wp.playback || !canPlay) return;

    applyingRemoteRef.current = true;
    hasSyncedRef.current = true;

    const targetSeconds = wp.getCurrentPosition() / 1000;
    player.currentTime = targetSeconds;

    if (!wp.playback.playing) {
      player.pause();
      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 200);
      return;
    }

    void player.play();

    const catchUp = () => {
      const freshTarget = wp.getCurrentPosition() / 1000;
      const diff = Math.abs(player.currentTime - freshTarget);
      if (diff > 0.2) {
        player.currentTime = freshTarget;
      }
      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 200);
    };

    const unsub = player.listen("playing", () => {
      unsub();
      catchUp();
    });
    const failsafe = window.setTimeout(() => {
      unsub();
      catchUp();
    }, 2000);

    return () => {
      unsub();
      window.clearTimeout(failsafe);
    };
  }, [wp, player, wp?.playback, canPlay]);

  useEffect(() => {
    if (!wp || !player) return;

    const handlePlay = () => {
      if (applyingRemoteRef.current || !hasSyncedRef.current) return;
      wp.emitPlay();
    };
    const handlePause = () => {
      if (applyingRemoteRef.current || !hasSyncedRef.current) return;
      wp.emitPause();
    };
    const handleSeeked = () => {
      if (applyingRemoteRef.current || !hasSyncedRef.current) return;
      const now = Date.now();
      if (now - lastLocalSeekAtRef.current < 200) return;
      lastLocalSeekAtRef.current = now;
      wp.emitSeek(Math.floor(player.currentTime * 1000));
    };

    const unsubPlay = player.listen("play", handlePlay);
    const unsubPause = player.listen("pause", handlePause);
    const unsubSeeked = player.listen("seeked", handleSeeked);

    return () => {
      unsubPlay();
      unsubPause();
      unsubSeeked();
    };
  }, [wp, player]);

  useEffect(() => {
    if (!wp || !player) return;
    if (paused || seeking) return;

    const id = window.setInterval(() => {
      if (applyingRemoteRef.current) return;
      const targetMs = wp.getCurrentPosition();
      const localMs = player.currentTime * 1000;
      const diff = targetMs - localMs;
      const abs = Math.abs(diff);
      if (abs < DRIFT_IGNORE_MS) return;
      if (abs > DRIFT_HARD_SEEK_MS) {
        applyingRemoteRef.current = true;
        player.currentTime = targetMs / 1000;
        window.setTimeout(() => {
          applyingRemoteRef.current = false;
        }, 100);
      }
    }, RECONCILE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [wp, player, paused, seeking]);

  return null;
}
