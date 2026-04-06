"use client";

import { useParams } from "next/navigation";
import { SeriesDetailModal } from "@/features/catalog/components/series-detail-modal";

export default function SeriesModalPage() {
  const { id } = useParams<{ id: string }>();

  return <SeriesDetailModal seriesId={id} open />;
}
