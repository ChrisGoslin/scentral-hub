# Todo Inbox

Use this folder as the shared place for review items and known untouched issues.

## Needs Your Review

- [`app/(main)/social/SocialClient.tsx`](../../app/(main)/social/SocialClient.tsx) has an in-progress type cast fix (`setPosts(latest as WearPost[])`) that was already present in the worktree before the last interruption. Still left untouched — not committed this pass either, review and commit separately.

## Untouched Issues

- [`app/(main)/spritz/WearNoteSheet.tsx`](../../app/(main)/spritz/WearNoteSheet.tsx), [`app/(main)/spritz/SpritzClient.tsx`](../../app/(main)/spritz/SpritzClient.tsx), and the related wear-log routes were intentionally left alone after you said you would handle the other session yourself.
- `.playwright-cli/` and `output/` are generated artifacts from the last local run and have not been cleaned up.

## Notes

- Add new review items here as we find them.
- Keep this folder small and current so it stays useful.

## Added 2026-07-17

- [`app-store-launch-checklist.md`](app-store-launch-checklist.md) — App Store screenshot/story sequence from the teardown's §7, converted into an owned checklist per the teardown's Pre-Launch Cut section.
