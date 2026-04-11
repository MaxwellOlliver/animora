import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeriesDetailContent } from "@/features/catalog/components/series-detail-modal";
import { fetchSeriesDetail } from "@/features/catalog/queries/fetch-series-detail.server";
import { ApiError } from "@/lib/api";

type SeriesPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const series = await fetchSeriesDetail(id);
    const genres = series.genres.map((g) => g.name);

    return {
      title: `${series.name} - animora`,
      description:
        series.synopsis.length > 160
          ? `${series.synopsis.slice(0, 157)}...`
          : series.synopsis,
      keywords: [series.name, ...genres, "anime", "streaming"],
      openGraph: {
        title: series.name,
        description: series.synopsis,
        type: "video.tv_show",
      },
    };
  } catch {
    return { title: "Series - animora" };
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params;

  try {
    await fetchSeriesDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="flex min-h-screen justify-center py-8">
      <SeriesDetailContent seriesId={id} />
    </main>
  );
}
