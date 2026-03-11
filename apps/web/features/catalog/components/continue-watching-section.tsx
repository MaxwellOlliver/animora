import { CatalogSection } from "./catalog-section";
import { EpisodeCard } from "./episode-card";

export function ContinueWatchingSection() {
  return (
    <CatalogSection
      title="Continue Watching"
      linkHref="/history"
      linkTitle="see history"
    >
      <EpisodeCard />
      <EpisodeCard />
      <EpisodeCard />
      <EpisodeCard />
      <EpisodeCard />
      <EpisodeCard />
      <EpisodeCard />
      <EpisodeCard />
      <EpisodeCard />
    </CatalogSection>
  );
}
