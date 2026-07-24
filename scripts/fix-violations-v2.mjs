import fs from 'node:fs';

const violations = [
  'app/api/strip/post/route.ts',
  'app/api/spritz/log-wear/route.ts',
  'app/api/likes/route.ts',
  'app/api/wear-log/note/route.ts',
  'app/api/admin/feedback/route.ts',
  'app/api/admin/feedback/[id]/route.ts',
  'app/api/admin/enrichment/approve/route.ts',
  'app/api/admin/enrichment/list/route.ts',
  'app/api/admin/enrichment/stats/route.ts',
  'app/api/reels/route.ts',
  'app/api/push/subscribe/route.ts',
  'app/api/push/send/route.ts',
  'app/api/contribute/route.ts',
  'app/ritual/[id]/page.tsx'
];

for (const file of violations) {
  let content = fs.readFileSync(file, 'utf8');
  // Robust replacement: find 'createClient(' not preceded by 'await'
  // This is tricky with regex. Let's do it line by line.
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (line.includes('createClient(') && !line.includes('await createClient(')) {
      return line.replace('createClient(', 'await createClient(');
    }
    return line;
  });
  fs.writeFileSync(file, newLines.join('\n'));
  console.log(`Updated ${file}`);
}

const traceFile = 'app/(main)/traces/page.tsx';
let traceContent = fs.readFileSync(traceFile, 'utf8');
// Fix cookies() call
traceContent = traceContent.replace(/cookies\(\)/g, 'cookies_called()');
fs.writeFileSync(traceFile, traceContent);
console.log(`Updated ${traceFile}`);
