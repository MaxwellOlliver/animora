ALTER TABLE "series" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(synopsis, '')), 'B')
      )) STORED;--> statement-breakpoint
CREATE INDEX "series_search_vector_idx" ON "series" USING gin ("search_vector");