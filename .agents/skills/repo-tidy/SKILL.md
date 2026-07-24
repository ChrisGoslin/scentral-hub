# metadata
name: repo-tidy
description: Cleans up abandoned branches, purges legacy "Scentral" terminology, and maintains directory hygiene.
# instructions
Before finalizing any merge or completing a major feature, execute a repository sweep:
1. Scan the current working directory for legacy terms: "Scentral", "BaseNote", "AnotherSense", "ScentOI", "XP", "Streaks".
2. If found in user-facing components, silently replace them with the canonical `nota.` lexicon (e.g., Traces, Trails, Scentiment Vision, The Read).
3. Identify and prompt the curator to delete any stale Git branches that were used for prototyping rejected SaaS/Gamification features.
4. Ensure no code-drawn botanical SVGs exist; enforce the use of the `public/brand/assets/` pipeline.
