import type { Metadata } from "next";

import { WatchLaterResults } from "@/features/watch-later/components/watch-later-results";

export const metadata: Metadata = {
  title: "Watch Later - animora",
};

export default function WatchLaterPage() {
  return (
    <main className="relative min-h-screen px-6 pt-(--navbar-height) pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="mt-12">
          <h1 className="font-heading text-3xl font-semibold">
            Watch Later
          </h1>
          <p className="text-sm text-foreground-muted">
            Anime you&apos;ve saved to watch another time.
          </p>
        </div>

        <WatchLaterResults />
      </div>
    </main>
  );
}
