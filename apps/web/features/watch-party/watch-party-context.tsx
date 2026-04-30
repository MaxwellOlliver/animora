"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

import { env } from "@/lib/env";

import { fetchWatchPartyTicket } from "./api";
import {
  type PlaybackStateBroadcast,
  type WatchPartyChatMessage,
  type WatchPartyFeedItem,
  type WatchPartyMember,
  type WatchPartySession,
  type WatchPartySnapshot,
  WP_CLIENT_EVENTS,
  WP_SERVER_EVENTS,
} from "./types";

function systemMessage(content: string): WatchPartyFeedItem {
  return {
    kind: "system",
    id: `sys-${crypto.randomUUID()}`,
    content,
    at: Date.now(),
  };
}

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "closed"
  | "error";

interface LocalPlaybackAnchor {
  playing: boolean;
  position: number;
  receivedAt: number;
  actorProfileId: string | null;
}

interface WatchPartyContextValue {
  code: string;
  status: ConnectionStatus;
  error: string | null;
  session: WatchPartySession | null;
  members: WatchPartyMember[];
  chat: WatchPartyFeedItem[];
  selfProfileId: string | null;
  isOwner: boolean;
  playback: LocalPlaybackAnchor | null;
  getCurrentPosition: () => number;
  sendChat: (content: string) => void;
  emitPlay: () => void;
  emitPause: () => void;
  emitSeek: (position: number) => void;
  kick: (profileId: string) => void;
  onRemotePlayback: (
    listener: (broadcast: PlaybackStateBroadcast) => void,
  ) => () => void;
}

const WatchPartyContext = createContext<WatchPartyContextValue | null>(null);

export function useWatchParty(): WatchPartyContextValue | null {
  return useContext(WatchPartyContext);
}

export function useRequiredWatchParty(): WatchPartyContextValue {
  const ctx = useContext(WatchPartyContext);
  if (!ctx) throw new Error("useRequiredWatchParty outside WatchPartyProvider");
  return ctx;
}

interface WatchPartyProviderProps {
  code: string;
  children: ReactNode;
  onSessionClosed?: (reason: string) => void;
}

export function WatchPartyProvider({
  code,
  children,
  onSessionClosed,
}: WatchPartyProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<WatchPartySession | null>(null);
  const [members, setMembers] = useState<WatchPartyMember[]>([]);
  const [chat, setChat] = useState<WatchPartyFeedItem[]>([]);
  const membersRef = useRef<WatchPartyMember[]>([]);
  const [selfProfileId, setSelfProfileId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<LocalPlaybackAnchor | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const remotePlaybackListeners = useRef(
    new Set<(b: PlaybackStateBroadcast) => void>(),
  );
  const lastPlayingRef = useRef<boolean | null>(null);

  const applyPlaybackBroadcast = useCallback(
    (payload: {
      playing: boolean;
      position: number;
      actorProfileId?: string;
    }) => {
      setPlayback({
        playing: payload.playing,
        position: payload.position,
        receivedAt: Date.now(),
        actorProfileId: payload.actorProfileId ?? null,
      });
    },
    [],
  );

  useEffect(() => {
    let disposed = false;
    setStatus("connecting");
    setError(null);

    (async () => {
      try {
        console.log("[wp] fetching ticket...");
        const ticket = await fetchWatchPartyTicket();
        console.log("[wp] got ticket", {
          profileId: ticket.profileId,
          hasToken: Boolean(ticket.token),
        });
        if (disposed) return;
        setSelfProfileId(ticket.profileId);

        const apiOrigin = new URL(env.NEXT_PUBLIC_API_URL).origin;
        const socket = io(`${apiOrigin}/watch-party`, {
          transports: ["websocket"],
          auth: {
            token: ticket.token,
            profileId: ticket.profileId,
            code,
          },
          reconnection: true,
          reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        socket.onAny((event, ...args) => {
          console.log(`[wp] ← ${event}`, ...args);
        });
        socket.onAnyOutgoing((event, ...args) => {
          console.log(`[wp] → ${event}`, ...args);
        });

        socket.on("connect", () => {
          console.log("[wp] ← connect", socket.id);
          setStatus("connected");
        });
        socket.on("disconnect", (reason) => {
          console.log("[wp] ← disconnect", reason);
          setStatus("closed");
        });
        socket.on("connect_error", (err: Error & { data?: unknown }) => {
          console.log("[wp] ← connect_error", {
            message: err.message,
            name: err.name,
            data: err.data,
            stack: err.stack,
          });
          setStatus("error");
          setError(err.message);
        });

        socket.on(
          WP_SERVER_EVENTS.SESSION_SNAPSHOT,
          (snapshot: WatchPartySnapshot) => {
            setSession(snapshot.session);
            setMembers(snapshot.members);
            membersRef.current = snapshot.members;
            setChat(
              snapshot.chatBacklog.map((msg) => ({ kind: "chat", ...msg })),
            );
            lastPlayingRef.current = snapshot.playback.playing;
            applyPlaybackBroadcast({
              playing: snapshot.playback.playing,
              position: snapshot.playback.position,
            });
          },
        );

        socket.on(
          WP_SERVER_EVENTS.MEMBER_JOINED,
          (member: WatchPartyMember) => {
            setMembers((prev) => {
              const next = prev.some((m) => m.profileId === member.profileId)
                ? prev
                : [...prev, member];
              membersRef.current = next;
              return next;
            });
            setChat((prev) =>
              [...prev, systemMessage(`${member.displayName} joined`)].slice(
                -200,
              ),
            );
          },
        );

        socket.on(
          WP_SERVER_EVENTS.MEMBER_LEFT,
          ({ profileId }: { profileId: string }) => {
            const name =
              membersRef.current.find((m) => m.profileId === profileId)
                ?.displayName ?? "Someone";
            setMembers((prev) => {
              const next = prev.filter((m) => m.profileId !== profileId);
              membersRef.current = next;
              return next;
            });
            setChat((prev) =>
              [...prev, systemMessage(`${name} left`)].slice(-200),
            );
          },
        );

        socket.on(
          WP_SERVER_EVENTS.MEMBER_KICKED,
          ({ profileId }: { profileId: string }) => {
            const name =
              membersRef.current.find((m) => m.profileId === profileId)
                ?.displayName ?? "Someone";
            setMembers((prev) => {
              const next = prev.filter((m) => m.profileId !== profileId);
              membersRef.current = next;
              return next;
            });
            setChat((prev) =>
              [...prev, systemMessage(`${name} was kicked`)].slice(-200),
            );
          },
        );

        socket.on(
          WP_SERVER_EVENTS.SESSION_OWNER_CHANGED,
          ({ ownerProfileId }: { ownerProfileId: string }) => {
            const newOwnerName =
              membersRef.current.find((m) => m.profileId === ownerProfileId)
                ?.displayName ?? "Someone";
            setSession((prev) => (prev ? { ...prev, ownerProfileId } : prev));
            setChat((prev) =>
              [
                ...prev,
                systemMessage(`${newOwnerName} is now the owner`),
              ].slice(-200),
            );
          },
        );

        socket.on(WP_SERVER_EVENTS.CHAT_NEW, (msg: WatchPartyChatMessage) => {
          setChat((prev) =>
            [...prev, { kind: "chat" as const, ...msg }].slice(-200),
          );
        });

        socket.on(
          WP_SERVER_EVENTS.PLAYBACK_STATE,
          (broadcast: PlaybackStateBroadcast) => {
            const wasPlaying = lastPlayingRef.current;
            lastPlayingRef.current = broadcast.playing;

            applyPlaybackBroadcast(broadcast);
            remotePlaybackListeners.current.forEach((fn) => fn(broadcast));

            if (broadcast.actorProfileId && wasPlaying !== broadcast.playing) {
              const name =
                membersRef.current.find(
                  (m) => m.profileId === broadcast.actorProfileId,
                )?.displayName ?? "Someone";
              const action = broadcast.playing ? "resumed" : "paused";
              setChat((prev) =>
                [...prev, systemMessage(`${name} ${action} playback`)].slice(
                  -200,
                ),
              );
            }
          },
        );

        socket.on(
          WP_SERVER_EVENTS.SESSION_CLOSED,
          ({ reason }: { reason: string }) => {
            setStatus("closed");
            onSessionClosed?.(reason);
          },
        );

        socket.on(
          WP_SERVER_EVENTS.ERROR,
          ({ message }: { message: string }) => {
            setError(message);
          },
        );
      } catch (err) {
        console.log("[wp] setup failed", err);
        if (disposed) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Connection failed");
      }
    })();

    return () => {
      disposed = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [code, applyPlaybackBroadcast, onSessionClosed]);

  const getCurrentPosition = useCallback(() => {
    if (!playback) return 0;
    if (!playback.playing) return playback.position;
    return playback.position + (Date.now() - playback.receivedAt);
  }, [playback]);

  const sendChat = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    socketRef.current?.emit(WP_CLIENT_EVENTS.CHAT_SEND, { content: trimmed });
  }, []);

  const emitPlay = useCallback(() => {
    socketRef.current?.emit(WP_CLIENT_EVENTS.PLAYBACK_PLAY);
  }, []);

  const emitPause = useCallback(() => {
    socketRef.current?.emit(WP_CLIENT_EVENTS.PLAYBACK_PAUSE);
  }, []);

  const emitSeek = useCallback((position: number) => {
    socketRef.current?.emit(WP_CLIENT_EVENTS.PLAYBACK_SEEK, {
      position: Math.max(0, Math.floor(position)),
    });
  }, []);

  const kick = useCallback((profileId: string) => {
    socketRef.current?.emit(WP_CLIENT_EVENTS.MEMBER_KICK, { profileId });
  }, []);

  const onRemotePlayback = useCallback(
    (listener: (b: PlaybackStateBroadcast) => void) => {
      remotePlaybackListeners.current.add(listener);
      return () => {
        remotePlaybackListeners.current.delete(listener);
      };
    },
    [],
  );

  const value = useMemo<WatchPartyContextValue>(
    () => ({
      code,
      status,
      error,
      session,
      members,
      chat,
      selfProfileId,
      isOwner: Boolean(
        session && selfProfileId && session.ownerProfileId === selfProfileId,
      ),
      playback,
      getCurrentPosition,
      sendChat,
      emitPlay,
      emitPause,
      emitSeek,
      kick,
      onRemotePlayback,
    }),
    [
      code,
      status,
      error,
      session,
      members,
      chat,
      selfProfileId,
      playback,
      getCurrentPosition,
      sendChat,
      emitPlay,
      emitPause,
      emitSeek,
      kick,
      onRemotePlayback,
    ],
  );

  return (
    <WatchPartyContext.Provider value={value}>
      {children}
    </WatchPartyContext.Provider>
  );
}
