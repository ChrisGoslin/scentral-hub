# AnotherSense App Store Screenshots

Complete set of high-resolution screenshots for iOS App Store and Google Play Store.

## Files Location
- iOS: `assets/app-store-screenshots/ios/` (5 screens, 1284×2778 px each)
- Android: `assets/app-store-screenshots/android/` (5 screens, 1440×3200 px each)
- Manifest: `assets/app-store-screenshots/manifest.json`

## Screenshots Included

### Landing Page
- **iOS:** ios_landing_1284x2778.png (35 KB)
- **Android:** android_landing_1440x3200.png (36 KB)
- Shows: AnotherSense brand identity, hero section, onboarding CTA

### Discovery
- **iOS:** ios_discover_1284x2778.png (44 KB)
- **Android:** android_discover_1440x3200.png (47 KB)
- Shows: Fragrance search, filtering, 280+ catalogue exploration

### Living Wardrobe (Collection)
- **iOS:** ios_collection_1284x2778.png (44 KB)
- **Android:** android_collection_1440x3200.png (47 KB)
- Shows: Apothecary Grid shelf, 4-tier affinity layout, drag-and-drop

### You (Personalization & XP)
- **iOS:** ios_you_1284x2778.png (44 KB)
- **Android:** android_you_1440x3200.png (47 KB)
- Shows: XP progression (6 levels), user profile, achievement tracking

### Spritz Schedule (Aura)
- **iOS:** ios_spritz_1284x2778.png (7.6 KB)
- **Android:** android_spritz_1440x3200.png (8.4 KB)
- Shows: AI-driven daily ritual planner, Aura recommendations

## Technical Specifications

### iOS
- Device: iPhone 14 Pro
- Resolution: 1284×2778 pixels
- Scale: 3x
- Format: PNG, 8-bit RGB
- Total: 5 screenshots, 174.6 KB

### Android
- Device: Google Pixel 7
- Resolution: 1440×3200 pixels
- Scale: 3x
- Format: PNG, 8-bit RGB
- Total: 5 screenshots, 202.4 KB

## App Store Requirements

### iOS App Store Connect
- Minimum 2 screenshots, maximum 10 per language
- Required format: 1284×2778 pixels ✓
- Currently provided: 5 screenshots ✓
- Format: PNG ✓

### Google Play Console
- Minimum 2 screenshots, maximum 8 per language
- Recommended format for phones: 1440×3200 pixels ✓
- Currently provided: 5 screenshots ✓
- Format: PNG ✓

## How to Use

1. **iOS submission:** Copy ios/ folder contents directly to App Store Connect
2. **Android submission:** Copy android/ folder contents directly to Google Play Console
3. **Automated use:** Reference manifest.json for programmatic asset access

## Generation Method

Screenshots were captured using Playwright automation:
- Script: `scripts/capture-app-store-screenshots.mjs`
- Source: https://scentral-seven.vercel.app
- Date: 2026-06-21
- Network idle wait: 1500ms per screen

To regenerate:
```bash
npm run build  # Ensure dependencies installed
node scripts/capture-app-store-screenshots.mjs
```

## Metadata

File: `assets/app-store-screenshots/manifest.json`
Contains:
- Platform name and capture timestamp
- Device specifications for each platform
- Screen descriptions and file references
- Automated reference for CI/CD pipelines
