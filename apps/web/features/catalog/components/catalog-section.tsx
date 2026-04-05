"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface CatalogSectionProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkTitle?: string;
}

const btnClasses =
  "text-foreground hover:text-primary absolute h-full top-0 flex items-center p-3 from-background via-70% via-background/60 to-transparent cursor-pointer z-10";

export function CatalogSection({
  children,
  title,
  subtitle,
  linkHref,
  linkTitle = "see all",
}: CatalogSectionProps) {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollableRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollableRef.current;
    if (!el) return;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollableRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="catalog-section relative z-10 flex flex-col gap-4 px-12 py-8 rounded-lg">
      <div className="flex w-full items-center">
        <h3 className="font-heading text-2xl leading-8 font-semibold">
          {title}
        </h3>
        {linkHref && (
          <Link
            href={linkHref}
            className="text-sm flex items-center gap-2 text-secondary hover:underline absolute right-12 top-12"
          >
            {linkTitle}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {subtitle && (
        <p className="text-base text-foreground-muted">{subtitle}</p>
      )}
      <div className="relative overflow-hidden">
        {canScrollLeft && (
          <button
            aria-label="previous"
            onClick={() => scroll("left")}
            className={cn(btnClasses, "left-0 bg-linear-to-r")}
          >
            <ChevronLeft />
          </button>
        )}
        {canScrollRight && (
          <button
            aria-label="next"
            onClick={() => scroll("right")}
            className={cn(btnClasses, "right-0 bg-linear-to-l")}
          >
            <ChevronRight />
          </button>
        )}
        <div
          ref={scrollableRef}
          onScroll={updateScrollState}
          className="flex overflow-x-auto scroll-smooth scrollbar-none"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
