"use client";

import Hls from "hls.js";
import { Volume2Icon, VolumeOffIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface TrailerPlayerProps {
  src?: string | null;
  poster: string;
  alt: string;
}

export function TrailerPlayer({ src, poster, alt }: TrailerPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 10, maxMaxBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }

    const handlePlaying = () => setReady(true);
    video.addEventListener("playing", handlePlaying);

    return () => {
      video.removeEventListener("playing", handlePlaying);
      hls?.destroy();
    };
  }, [src]);

  if (!src) {
    return (
      <Image
        src={poster}
        alt={alt}
        width={480}
        height={270}
        className="size-full object-cover"
      />
    );
  }

  return (
    <div className="relative size-full">
      <Image
        src={poster}
        alt={alt}
        width={480}
        height={270}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
        unoptimized
      />
      <video
        ref={videoRef}
        muted={muted}
        playsInline
        loop
        className="size-full object-cover"
      />
      {ready && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="absolute right-2 bottom-2 rounded-full bg-black/60 p-1.5 text-white transition-opacity hover:bg-black/80"
        >
          {muted ? (
            <VolumeOffIcon className="size-4" />
          ) : (
            <Volume2Icon className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}
