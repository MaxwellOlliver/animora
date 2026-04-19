"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";

import { WatchPartyProvider } from "./watch-party-context";

export const WP_LEAVE_EVENT = "watch-party:leave";
export const WP_JOIN_EVENT = "watch-party:join";

function stripWpParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete("wp");
  window.history.replaceState(null, "", url.toString());
}

function setWpParam(code: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("wp", code);
  window.history.replaceState(null, "", url.toString());
}

export function WatchPartyShell({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(null);

  const handleClosed = useCallback(() => {
    stripWpParam();
    setCode(null);
    window.dispatchEvent(new CustomEvent(WP_LEAVE_EVENT));
  }, []);

  useEffect(() => {
    const initial = new URL(window.location.href).searchParams.get("wp");
    if (initial) setCode(initial);

    const onLeave = () => {
      stripWpParam();
      setCode(null);
    };
    const onJoin = (e: Event) => {
      const detail = (e as CustomEvent<{ code: string }>).detail;
      if (!detail?.code) return;
      setWpParam(detail.code);
      setCode(detail.code);
    };
    window.addEventListener(WP_LEAVE_EVENT, onLeave);
    window.addEventListener(WP_JOIN_EVENT, onJoin);
    return () => {
      window.removeEventListener(WP_LEAVE_EVENT, onLeave);
      window.removeEventListener(WP_JOIN_EVENT, onJoin);
    };
  }, []);

  if (!code) return <>{children}</>;

  return (
    <WatchPartyProvider
      code={code.toUpperCase()}
      onSessionClosed={handleClosed}
    >
      {children}
    </WatchPartyProvider>
  );
}
