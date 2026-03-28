"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Bookmark, Info, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroSlide = {
  id: string;
  title: string;
  titleImage?: string;
  genres: string[];
  seasons?: number;
  movies?: number;
  audio: string[];
  description: string;
  backgroundImage: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  autoPlayInterval?: number;
};

export function HeroCarousel({
  slides,
  autoPlayInterval = 15000,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setTimeout(next, autoPlayInterval);
    return () => clearTimeout(timer);
  }, [current, next, autoPlayInterval, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / autoPlayInterval, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [current, autoPlayInterval, slides.length]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <section className="relative z-0 h-[85vh] w-full grid grid-cols-12 overflow-visible">
      <div className="absolute -z-10 inset-x-0 top-0 h-[calc(100%+14rem)]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === current ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={s.backgroundImage}
              alt={s.title}
              fill
              className="object-cover object-top"
              priority={i === 0}
              unoptimized
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-75% via-[#121212b3] to-transparent" />
      </div>
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 flex flex-col gap-5 justify-end px-12 pb-12 transition-opacity duration-700 max-md:items-center md:max-w-[70%] xl:max-w-[41%]",
            i === current ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {s.titleImage ? (
            <Image
              src={s.titleImage}
              alt={s.title}
              width={300}
              height={100}
              className="max-h-36 max-w-72 w-auto object-contain object-left"
            />
          ) : (
            <h2 className="font-heading text-4xl font-bold text-foreground">
              {s.title}
            </h2>
          )}

          <p className="text-xs text-foreground-muted flex gap-4">
            <span>{s.genres.join(" • ")}</span>
            {s.seasons && <span>{s.seasons} seasons</span>}
            {s.movies && <span>{s.movies} movies</span>}
            <span>{s.audio.join(" • ")}</span>
          </p>

          <p className="text-lg leading-6 line-clamp-4 text-foreground">
            {s.description}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Button size="lg" className="px-12 max-md:w-full">
              <Play className="size-4 fill-current" />
              watch
            </Button>
            <Button variant="pale" size="lg" className="max-md:flex-1">
              <Info />
              more details
            </Button>
            <Button variant="ghost" size="icon-lg">
              <Bookmark />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {slides.map((dot, j) => {
              const isActive = j === current;
              const size = 18;
              const stroke = 2;
              const r = (size - stroke) / 2;
              const circumference = 2 * Math.PI * r;

              return (
                <button
                  key={dot.id}
                  onClick={() => setCurrent(j)}
                  aria-label={`Go to slide ${j + 1}`}
                  className="relative size-4.5 "
                >
                  {isActive && (
                    <>
                      <svg
                        className="absolute inset-0"
                        width={size}
                        height={size}
                      >
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={r}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={stroke}
                          className="text-foreground/20"
                        />
                      </svg>
                      <svg
                        className="absolute inset-0 -rotate-90"
                        width={size}
                        height={size}
                        style={{
                          filter:
                            "drop-shadow(0 0 4px #2e94c3) drop-shadow(0 0 8px #2e94c380)",
                        }}
                      >
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={r}
                          fill="none"
                          stroke="#2e94c3"
                          strokeWidth={stroke}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={
                            circumference - progress * circumference
                          }
                        />
                      </svg>
                    </>
                  )}

                  <span
                    className={cn(
                      "absolute inset-1.25 rounded-full transition-all duration-500",
                      isActive
                        ? "bg-secondary shadow-[0_0_6px_#2e94c3]"
                        : "bg-foreground/40",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
