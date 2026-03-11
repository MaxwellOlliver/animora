import { CatalogSection } from "./catalog-section";
import { SeriesCard } from "./series-card";

export function RecommendedSection() {
  return (
    <CatalogSection title="Recommended" linkHref="/history" linkTitle="see all">
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
      <SeriesCard />
    </CatalogSection>
  );
}
