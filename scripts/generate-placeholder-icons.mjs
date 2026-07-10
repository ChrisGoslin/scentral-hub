import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Minimal 1x1 transparent PNG
const minimalPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), minimalPng);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), minimalPng);

console.log('Created placeholder icons in public/');
