"use client";

import Hls from "hls.js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface TrailerPlayerProps {
  src?: string | null;
  banner?: string;
  alt: string;
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
}

export function TrailerPlayer({
  src,
  banner,
  alt,
  muted: mutedProp,
}: TrailerPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const muted = mutedProp ?? false;

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
    if (!banner) return null;

    return (
      <Image
        src={banner}
        alt={alt}
        width={480}
        height={270}
        className="size-full object-cover"
      />
    );
  }

  return (
    <div className="relative size-full">
      {banner && (
        <Image
          src={banner}
          alt={alt}
          width={480}
          height={270}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
          unoptimized
        />
      )}
      <video
        ref={videoRef}
        muted={muted}
        playsInline
        loop
        className="size-full object-cover"
      />
    </div>
  );
}
