// Minimal Node ESM loader used only by tests/**: resolves the repo's "@/*"
// tsconfig path alias and falls back to appending .js/.ts when a bare
// extensionless specifier (e.g. an internal Next.js subpath, or an alias
// pointing at a source file written without an extension) doesn't resolve
// on its own. This lets node:test import real route handlers (route.ts)
// and their "@/..." imports without a bundler.
import { pathToFileURL } from 'node:url';

const ROOT = pathToFileURL(process.cwd() + '/').href;

async function resolveWithExtensionFallback(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND') {
      for (const ext of ['.js', '.ts', '.mjs']) {
        if (specifier.endsWith(ext)) continue;
        try {
          return await nextResolve(specifier + ext, context);
        } catch {
          // try the next extension
        }
      }
    }
    throw err;
  }
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    return resolveWithExtensionFallback(ROOT + specifier.slice(2), context, nextResolve);
  }
  return resolveWithExtensionFallback(specifier, context, nextResolve);
}
