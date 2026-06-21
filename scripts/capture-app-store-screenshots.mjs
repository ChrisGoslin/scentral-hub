#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const APP_URL = 'https://scentral-seven.vercel.app';

// Device configurations for App Store
const devices = {
  ios: {
    name: 'iPhone 14 Pro',
    width: 1284,
    height: 2778,
    deviceScaleFactor: 3,
    screens: [
      { name: 'landing', path: '/', description: 'Landing page' },
      { name: 'discover', path: '/discover', description: 'Discovery & Search' },
      { name: 'collection', path: '/collection', description: 'Living Wardrobe' },
      { name: 'you', path: '/you', description: 'XP & Personalization' },
      { name: 'spritz', path: '/spritz', description: 'Spritz Schedule' },
    ],
  },
  android: {
    name: 'Android Pixel 7',
    width: 1440,
    height: 3200,
    deviceScaleFactor: 3,
    screens: [
      { name: 'landing', path: '/', description: 'Landing page' },
      { name: 'discover', path: '/discover', description: 'Discovery & Search' },
      { name: 'collection', path: '/collection', description: 'Living Wardrobe' },
      { name: 'you', path: '/you', description: 'XP & Personalization' },
      { name: 'spritz', path: '/spritz', description: 'Spritz Schedule' },
    ],
  },
};

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Ensure screenshot directory exists
  const screenshotDir = './assets/app-store-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  for (const [platform, config] of Object.entries(devices)) {
    const platformDir = path.join(screenshotDir, platform);
    if (!fs.existsSync(platformDir)) {
      fs.mkdirSync(platformDir, { recursive: true });
    }

    console.log(`\n📱 Capturing ${platform.toUpperCase()} screenshots (${config.width}x${config.height})...`);

    // Set viewport size for this platform
    await page.setViewportSize({
      width: Math.floor(config.width / config.deviceScaleFactor),
      height: Math.floor(config.height / config.deviceScaleFactor),
    });

    for (const screen of config.screens) {
      try {
        const url = `${APP_URL}${screen.path}`;
        console.log(`  → ${screen.name}: ${screen.description}`);

        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for content to stabilize
        await page.waitForTimeout(1500);

        // Take screenshot at full resolution
        const filename = `${platform}_${screen.name}_${config.width}x${config.height}.png`;
        const filepath = path.join(platformDir, filename);

        await page.screenshot({
          path: filepath,
          fullPage: true,
        });

        console.log(`     ✓ Saved: ${filename}`);
      } catch (err) {
        console.error(`     ✗ Error capturing ${screen.name}: ${err.message}`);
      }
    }
  }

  await browser.close();

  // Generate manifest
  const manifest = {
    platform: 'AnotherSense App Store Screenshots',
    captured: new Date().toISOString(),
    ios: {
      device: 'iPhone 14 Pro',
      dimensions: '1284x2778px',
      screens: devices.ios.screens.map((s) => ({
        name: s.name,
        description: s.description,
        file: `ios/ios_${s.name}_1284x2778.png`,
      })),
    },
    android: {
      device: 'Android Pixel 7',
      dimensions: '1440x3200px',
      screens: devices.android.screens.map((s) => ({
        name: s.name,
        description: s.description,
        file: `android/android_${s.name}_1440x3200.png`,
      })),
    },
  };

  const manifestPath = path.join(screenshotDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest saved: ${manifestPath}`);
  console.log(`\n✓ All screenshots captured to: ${screenshotDir}`);
}

captureScreenshots().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
