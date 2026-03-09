Never create migration files manually. Always use `cd apps/api && bunx drizzle-kit generate` to generate migrations from entity changes. This keeps the journal and snapshots in sync.

After generating, rename the migration file from the random name to a descriptive one (e.g. `0017_playlist_metadata.sql`) and update the matching `tag` in `drizzle/meta/_journal.json`.
