"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

import { useDebouncedValue } from "../hooks/use-debounced-value";
import { categoriesQueryOptions } from "../queries/fetch-categories";
import { classificationsQueryOptions } from "../queries/fetch-classifications";
import { ExploreResults } from "./explore-results";
import { MultiSelectFilter } from "./multi-select-filter";

interface ExploreViewProps {
  initialQuery: string;
  initialCategoryIds: string[];
  initialClassificationIds: string[];
}

export function ExploreView({
  initialQuery,
  initialCategoryIds,
  initialClassificationIds,
}: ExploreViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [inputValue, setInputValue] = useState(initialQuery);
  const [committedQuery, setCommittedQuery] = useState(initialQuery.trim());
  const [categoryIds, setCategoryIds] = useState(initialCategoryIds);
  const [classificationIds, setClassificationIds] = useState(
    initialClassificationIds,
  );

  const debouncedInput = useDebouncedValue(inputValue, 400);

  useEffect(() => {
    setCommittedQuery(debouncedInput.trim());
  }, [debouncedInput]);

  const { data: categories = [] } = useQuery(categoriesQueryOptions);
  const { data: classifications = [] } = useQuery(classificationsQueryOptions);

  useEffect(() => {
    const params = new URLSearchParams();
    if (committedQuery) params.set("q", committedQuery);
    if (categoryIds.length > 0) {
      params.set("categories", categoryIds.join(","));
    }
    if (classificationIds.length > 0) {
      params.set("classifications", classificationIds.join(","));
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [committedQuery, categoryIds, classificationIds, pathname, router]);

  function submitSearch() {
    setCommittedQuery(inputValue.trim());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Input
          uiSize="lg"
          icon={<SearchIcon />}
          placeholder="A world where humanity lives inside cities surrounded by enormous Walls..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitSearch();
          }}
          wrapperClassName="w-full"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <MultiSelectFilter
          label="Categories"
          options={categories.map((c) => ({ id: c.id, label: c.name }))}
          selected={categoryIds}
          onChange={setCategoryIds}
        />
        <MultiSelectFilter
          label="Classification"
          options={classifications.map((c) => ({ id: c.id, label: c.name }))}
          selected={classificationIds}
          onChange={setClassificationIds}
        />
      </div>

      <ExploreResults
        filters={{
          q: committedQuery || undefined,
          categoryIds,
          classifications: classificationIds,
        }}
      />
    </div>
  );
}
