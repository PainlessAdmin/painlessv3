/**
 * Post-build script to make Astro 6 + @astrojs/cloudflare v13 output
 * compatible with Cloudflare Pages deployment.
 *
 * The adapter generates a Workers-style output (dist/server/entry.mjs)
 * but Pages expects _worker.js in the static output directory (dist/client).
 *
 * We copy the server bundle into dist/client/_worker.js/ as a Pages
 * Advanced Mode directory with an index.js entry point.
 */

import { readFileSync, writeFileSync, existsSync, cpSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const distServer = resolve('dist/server');
const distClient = resolve('dist/client');

// 1. Copy server files into dist/client/_worker.js/ directory (Pages Advanced Mode)
const workerDir = resolve(distClient, '_worker.js');
if (existsSync(distServer)) {
  mkdirSync(workerDir, { recursive: true });

  // Copy chunks and server entry
  cpSync(resolve(distServer, 'chunks'), resolve(workerDir, 'chunks'), { recursive: true });
  cpSync(resolve(distServer, 'entry.mjs'), resolve(workerDir, 'entry.mjs'));
  if (existsSync(resolve(distServer, 'virtual_astro_middleware.mjs'))) {
    cpSync(resolve(distServer, 'virtual_astro_middleware.mjs'), resolve(workerDir, 'virtual_astro_middleware.mjs'));
  }

  // Create index.js that re-exports entry.mjs
  writeFileSync(
    resolve(workerDir, 'index.js'),
    'export { default } from "./entry.mjs";\nexport * from "./entry.mjs";\n'
  );

  console.log('[fix-pages] Copied server bundle to dist/client/_worker.js/');
}

// 2. Remove the generated wrangler.json from _worker.js (Pages doesn't need it there)
const copiedWranglerJson = resolve(workerDir, 'wrangler.json');
if (existsSync(copiedWranglerJson)) {
  const { unlinkSync } = await import('node:fs');
  unlinkSync(copiedWranglerJson);
}

// 3. Fix the original wrangler.json in dist/server (used by Pages build system)
const wranglerJsonPath = resolve(distServer, 'wrangler.json');
if (existsSync(wranglerJsonPath)) {
  const config = JSON.parse(readFileSync(wranglerJsonPath, 'utf-8'));

  // Remove KV namespaces without ids
  if (config.kv_namespaces) {
    config.kv_namespaces = config.kv_namespaces.filter((ns) => ns.id);
  }

  // Remove reserved ASSETS binding
  if (config.assets?.binding === 'ASSETS') {
    delete config.assets;
  }

  // Remove all fields not supported by Pages
  const unsupportedPageFields = [
    'main', 'rules', 'no_bundle', 'triggers', 'definedEnvironments',
    'secrets_store_secrets', 'unsafe_hello_world', 'worker_loaders',
    'ratelimits', 'vpc_services', 'python_modules',
  ];
  for (const field of unsupportedPageFields) {
    delete config[field];
  }

  // Clean up dev fields
  if (config.dev) {
    delete config.dev.enable_containers;
    delete config.dev.generate_types;
  }

  writeFileSync(wranglerJsonPath, JSON.stringify(config));
}

console.log('[fix-pages] Done. Output ready for Cloudflare Pages.');
