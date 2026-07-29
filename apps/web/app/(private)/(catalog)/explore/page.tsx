import type { Metadata } from "next";
import Image from "next/image";

import { ExploreView } from "@/features/explore/components/explore-view";

export const metadata: Metadata = {
  title: "Explore - animora",
};

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    categories?: string;
    classifications?: string;
  }>;
};

function parseIds(value?: string): string[] {
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q, categories, classifications } = await searchParams;

  return (
    <main className="relative min-h-screen px-6 pt-(--navbar-height) pb-12">
      <div className="absolute inset-x-0 top-0 -z-10 h-112 overflow-hidden">
        <Image
          src="/images/catalog/ds-banner.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/85 via-70% to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-background/60 via-transparent to-transparent" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="mt-12">
          <h1 className="font-heading text-3xl font-semibold">Explore</h1>
          <p className="text-sm text-foreground-muted">
            Discover anime by title, category, or classification.
          </p>
        </div>

        <ExploreView
          initialQuery={q ?? ""}
          initialCategoryIds={parseIds(categories)}
          initialClassificationIds={parseIds(classifications)}
        />
      </div>
    </main>
  );
}
