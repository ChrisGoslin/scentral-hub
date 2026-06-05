# Project Directory Structure

```
.
 |-app
 | |-favicon.ico
 | |-disclaimer
 | | |-page.tsx
 | |-auth
 | | |-confirm
 | | | |-route.ts
 | | |-callback
 | | | |-route.ts
 | |-learning
 | | |-page.tsx
 | |-library
 | | |-page.tsx
 | |-components
 | | |-TheExhibition.tsx
 | | |-ui
 | | | |-SensoryAnatomy.tsx
 | | |-useToast.tsx
 | | |-AccordCreator.tsx
 | | |-DemoSave.tsx
 | | |-BottomNav.tsx
 | | |-ToastProvider.tsx
 | | |-SpritzSchedulerTeaser.tsx
 | | |-DynamicAura.tsx
 | | |-PWARegistration.tsx
 | | |-SupabaseAuth.tsx
 | | |-ScentBloom.tsx
 | | |-AudioChord.tsx
 | |-layout.tsx
 | |-lib
 | | |-types.ts
 | | |-harmonyEngine.ts
 | | |-presets.ts
 | |-dna-match
 | | |-DNAMatchClient.tsx
 | | |-page.tsx
 | |-api
 | | |-demo
 | | | |-save
 | | |-schedule
 | | | |-save
 | | |-formulate
 | | | |-route.ts
 | | |-layering
 | | | |-save
 | | |-sommelier
 | | | |-reflect
 | | | |-route.ts
 | | |-scan
 | | | |-route.ts
 | | |-dna-match
 | | | |-route.ts
 | | |-generate-image
 | | | |-route.ts
 | | |-fragrances
 | | | |-route.ts
 | |-(main)
 | | |-schedule
 | | | |-types.ts
 | | | |-ScheduleClient.tsx
 | | | |-SlotCard.tsx
 | | | |-SaveSheet.tsx
 | | | |-page.tsx
 | | |-collection
 | | | |-[id]
 | | | |-page.tsx
 | | | |-CollectionClient.tsx
 | | |-layering
 | | | |-LayeringClient.tsx
 | | | |-page.tsx
 | | |-profile
 | | | |-page.tsx
 | | |-layout.tsx
 | | |-you
 | | | |-YouClient.tsx
 | | | |-loading.tsx
 | | | |-page.tsx
 | |-community
 | | |-page.tsx
 | |-page.tsx
 | |-design-system
 | | |-page.tsx
 | |-globals.css
 |-bin
 | |-optimize-meta
 | |-fingerprint
 | |-deploy
 |-postcss.config.mjs
 |-Dockerfile
 |-GENERATION_PROGRESS.md
 |-tsconfig.tsbuildinfo
 |-utils
 | |-supabase
 | | |-middleware.ts
 | | |-client.ts
 | | |-server.ts
 |-docs
 | |-MASTER_WARDROBE.md
 | |-SEED_STATUS.md
 | |-scentral-formulate-route.ts
 | |-scentral-images-claude-code-prompt.md
 | |-scentral-mvp-spec.md
 | |-scentral-mobile-nav-claude-code-prompt.md
 | |-scentral-claude-code-session.md
 | |-FRAGRANCE_SEEDING_GUIDE.md
 | |-SETUP_IMAGE_GENERATION.md
 | |-scentral-formulate-claude-code-prompt.md
 | |-PR_DESCRIPTION.md
 | |-ux
 | | |-scentral-landing-spec.md
 | | |-scentral-landing-checklist.md
 | |-scentral-fabrizio-demo-script.md
 | |-scentral-build-sprint.docx
 |-household-finance-pipeline-spec.md
 |-next-env.d.ts
 |-PROJECTS.md
 |-supabase
 | |-migrations
 | | |-20260601_add_photographic_description.sql
 | | |-20260602235332_spritz_schedules_v2.sql
 | | |-20260507_initial_schema.sql
 | | |-20260530_add_image_url_to_fragrances.sql
 | | |-20260510_security_fixes.sql
 | | |-20260512_seed_fragrances_rls_bypass.sql
 | | |-20260605_add_popularity_rank.sql
 | | |-20260510_missing_fk_indexes.sql
 | | |-20260602120000_spritz_schedules_v2.sql
 | | |-20260601_resonance_updates.sql
 | | |-20260521_dna_matches_cache.sql
 | | |-20260530_wear_logs.sql
 | | |-20260510_rls_performance_fixes.sql
 | | |-20260508_add_reaction.sql
 | | |-001_enable_rls_layering_combinations.sql
 | | |-20260602_add_fragrance_ids_to_layering_combinations.sql
 | | |-20260512_seed_fragrances.sql
 | | |-20260507000001_alter_fragrances.sql
 | | |-20260601_resonance_engine.sql
 |-README.md
 |-components
 | |-ui
 | | |-LoadingShimmer.tsx
 | | |-Card.tsx
 | | |-Disclosure.tsx
 | | |-Sheet.tsx
 | | |-ErrorInline.tsx
 | | |-Chip.tsx
 | | |-SensoryAnatomy.tsx
 | | |-Button.tsx
 | | |-EmptyState.tsx
 | |-auth
 | | |-AuthSheet.tsx
 |-public
 | |-file.svg
 | |-images
 | | |-landing-art.svg
 | |-vercel.svg
 | |-next.svg
 | |-manifest.webmanifest
 | |-globe.svg
 | |-window.svg
 | |-sw.js
 |-package-lock.json
 |-package.json
 |-scripts
 | |-verify_seed.js
 | |-create-pr.sh
 | |-_archive
 | | |-test-new-key.mjs
 | | |-generate-batch-direct.mjs
 | | |-test-env-key.mjs
 | | |-visual-heartbeat.mjs
 | | |-generate-batch-final.mjs
 | | |-retry-failed-images.mjs
 | | |-SCENTRAL-SCHEDULER-PROMPT.md
 | | |-generate-avatars.mjs
 | | |-test-migration.mjs
 | | |-fetch-images.mjs
 | | |-generate-all-images.mjs
 | | |-SCENTRAL-SCHEDULER-PRD.md
 | | |-test-models.mjs
 | | |-test-image-model.mjs
 | | |-generate-all-images-with-fallback.mjs
 | | |-export-wardrobe.mjs
 |-lib
 | |-design
 | | |-tokens.css
 | |-filter-fragrances.ts
 | |-types.ts
 | |-types-community.ts
 |-compose.yaml
 |-tsconfig.json
 |-GEMINI.md
 |-AGENTS.md
 |-compose.debug.yaml
 |-e2e
 | |-layering-save.spec.ts
 |-eslint.config.mjs
 |-CLAUDE.md
 |-next.config.ts
 |-DIRECTORY_STRUCTURE.md
```
