"use client";

import Hls from "hls.js";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function Player() {
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const url = searchParams.get("url");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  }, [url]);

  if (!url) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-lg">
          Missing <code className="rounded bg-white/10 px-2 py-1">?url=</code>{" "}
          query parameter
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <video
        ref={videoRef}
        controls
        autoPlay
        className="max-h-full max-w-full"
      />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense>
      <Player />
    </Suspense>
  );
}
