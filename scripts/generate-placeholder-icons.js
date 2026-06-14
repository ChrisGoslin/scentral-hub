const fs = require('fs');
const path = require('path');

// Minimal 1x1 transparent PNG
const minimalPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const publicDir = path.join(__dirname, '../public');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), minimalPng);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), minimalPng);

console.log('Created placeholder icons in public/');
