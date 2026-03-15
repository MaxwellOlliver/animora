import { ContinueWatchingSection } from "@/features/catalog/components/continue-watching-section";
import { HeroCarousel } from "@/features/catalog/components/hero-carousel";
import { RecommendedSection } from "@/features/catalog/components/recommended-section";

const heroSlides = [
  {
    id: "dandadan",
    title: "DanDaDan",
    titleImage: "/images/catalog/dandandan-logo.png",
    genres: ["Action", "Comedy"],
    seasons: 2,
    movies: 1,
    audio: ["Dub", "Sub"],
    description:
      "Ghosts, monsters, aliens, teen romance, battles...and the kitchen sink! This series has it all! Takakura, an occult maniac who doesn't believe in ghosts, and Ayase, a girl who doesn't believe in aliens, try to overcome their differences when they encounter the paranormal! This manga is out of this world!",
    backgroundImage: "/images/catalog/dandandan-banner.png",
  },
  {
    id: "aot",
    title: "Attack on Titan",
    titleImage: "/images/catalog/aot-logo.webp",
    genres: ["Action", "Drama"],
    seasons: 4,
    movies: 2,
    audio: ["Dub", "Sub"],
    description:
      "That day, the human race remembered the terror of being dominated by them, and the shame of being held captive in a birdcage... — Over 100 years ago, a natural predator of humanity appeared: the Titans, giant humanoid but mindless monsters whose sole purpose of existence seemed to be to devour humans. There was an insurmountable gap in power between them and mankind, and as a result, humanity was rapidly exterminated to the brink of extinction. The survivors responded by constructing three concentric walls: Wall Maria, Wall Rose and Wall Sina, which graced them with a century of peace. However, one day a Colossal Titan far larger than any other seen before breached the outer wall, allowing the smaller Titans to invade the human territory and forcing the survivors to retreat to the inner walls. Eren Jaeger, a boy whose mother was eaten during the invasion, vowed to wipe every last Titan off the face of the Earth, and joined the military determined to exact his revenge.",
    backgroundImage: "/images/catalog/aot-banner.jpg",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroCarousel slides={heroSlides} />
      <ContinueWatchingSection />
      <RecommendedSection />
    </main>
  );
}
