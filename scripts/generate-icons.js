// Generates PWA icons for Scentral: amber resin-drop on parchment.
// Run locally: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PARCHMENT = '#F7F3EE';
const AMBER_LIGHT = '#C98A4B';
const AMBER_DARK = '#7A4A1E';

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="drop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${AMBER_LIGHT}"/>
      <stop offset="100%" stop-color="${AMBER_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="${PARCHMENT}"/>
  <path
    d="M256,112 C256,112 168,248 168,322 C168,380 206,422 256,422 C306,422 344,380 344,322 C344,248 256,112 256,112 Z"
    fill="url(#drop)"
  />
  <ellipse cx="218" cy="260" rx="22" ry="34" fill="${PARCHMENT}" opacity="0.22"/>
</svg>
`;

// Portrait iOS device sizes sourced from a verified apple-touch-startup-image
// reference (SE/8, XR/11, XS Max/11 Pro Max, X/XS/11 Pro, iPad 9.7"). Newer
// iPhone (12+) device-width/height pairs were not available to verify, so
// those devices fall back to the browser default splash (no broken image).
const SPLASH_SIZES = [
  { w: 750, h: 1334 },
  { w: 828, h: 1792 },
  { w: 1242, h: 2688 },
  { w: 1125, h: 2436 },
  { w: 1536, h: 2048 },
];

function buildSplashSvg(w, h) {
  const dropSize = Math.round(Math.min(w, h) * 0.32);
  const x = Math.round((w - dropSize) / 2);
  const y = Math.round((h - dropSize) / 2);
  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="drop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${AMBER_LIGHT}"/>
      <stop offset="100%" stop-color="${AMBER_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${PARCHMENT}"/>
  <svg x="${x}" y="${y}" width="${dropSize}" height="${dropSize}" viewBox="0 0 512 512">
    <path
      d="M256,112 C256,112 168,248 168,322 C168,380 206,422 256,422 C306,422 344,380 344,322 C344,248 256,112 256,112 Z"
      fill="url(#drop)"
    />
    <ellipse cx="218" cy="260" rx="22" ry="34" fill="${PARCHMENT}" opacity="0.22"/>
  </svg>
</svg>
`;
}

async function main() {
  const iconsDir = path.join(__dirname, '../public/icons');
  const splashDir = path.join(iconsDir, 'splash');
  fs.mkdirSync(splashDir, { recursive: true });

  const svgBuffer = Buffer.from(svg);

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('Wrote public/icons/icon-192.png and public/icons/icon-512.png');

  for (const { w, h } of SPLASH_SIZES) {
    const file = `icon_${w}x${h}.png`;
    await sharp(Buffer.from(buildSplashSvg(w, h))).png().toFile(path.join(splashDir, file));
    console.log(`Wrote public/icons/splash/${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
