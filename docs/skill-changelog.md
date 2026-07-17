# Skill / Brief Changelog

Append-only log of places where a task brief's assumptions didn't match live reality, for whoever writes the next brief of this kind.

- **2026-07-17:** Brief assumed the Traces reaction drift (`anon_id`/`reaction_type` vs `user_id`/`reaction`) was isolated to `trace_reactions`. Actual: `insights_cache` had the identical class of drift (checked-in migration described a five-jsonb-column, `anon_id`-keyed shape; live DB was already `user_id`/`period`/`payload`). Next time: when a brief names one table as having migration/live drift, grep sibling tables that share the same original migration date/epic (`20260703_*` here) for the same pattern before assuming it's contained to the one named table.
