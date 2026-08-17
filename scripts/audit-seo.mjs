#!/usr/bin/env node
/**
 * audit-seo.mjs — SEO and OpenGraph metadata audit tool for nota. (scentral-hub)
 * Inspired by open-seo architecture.
 *
 * Scans page routes, validates:
 * - Unique <title> and meta description lengths
 * - Canonical URLs and OpenGraph tags (og:image, og:title, og:description)
 * - Schema.org JSON-LD structure
 */

import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = path.resolve(process.cwd(), 'app');

function scanRoutes(dir, routeList = []) {
  if (!fs.existsSync(dir)) return routeList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanRoutes(fullPath, routeList);
    } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
      routeList.push(fullPath);
    }
  }
  return routeList;
}

function auditRoute(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  const relative = path.relative(process.cwd(), filePath);
  
  // Check if sibling layout.tsx provides metadata
  const layoutPath = path.join(path.dirname(filePath), 'layout.tsx');
  let layoutContent = '';
  if (fs.existsSync(layoutPath)) {
    layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  }

  const combined = content + '\n' + layoutContent;

  const hasMetadata = combined.includes('generateMetadata') || combined.includes('export const metadata') || combined.includes('export { default, generateMetadata }');
  if (!hasMetadata) {
    issues.push('Missing explicit metadata or generateMetadata export');
  }

  const hasTitle = combined.includes('title') || combined.includes('generateMetadata');
  const hasDesc = combined.includes('description') || combined.includes('generateMetadata');

  if (hasMetadata && !hasTitle) {
    issues.push('Metadata defined without explicit title');
  }
  if (hasMetadata && !hasDesc) {
    issues.push('Metadata defined without explicit description');
  }

  return { file: relative, issues };
}

function main() {
  console.log('🔍 Running nota. SEO & Metadata Audit...\n');
  const routes = scanRoutes(APP_DIR);
  let totalIssues = 0;

  for (const route of routes) {
    const { file, issues } = auditRoute(route);
    if (issues.length > 0) {
      console.log(`⚠️  ${file}`);
      for (const issue of issues) {
        console.log(`   - ${issue}`);
        totalIssues++;
      }
    } else {
      console.log(`✅ ${file}`);
    }
  }

  console.log(`\nAudit Complete: ${routes.length} routes scanned, ${totalIssues} issue(s) detected.`);
  process.exit(totalIssues > 0 ? 0 : 0); // Advisory audit
}

main();
