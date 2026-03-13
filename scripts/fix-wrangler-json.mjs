/**
 * Post-build script to fix the generated wrangler.json for Cloudflare Pages compatibility.
 *
 * @astrojs/cloudflare v13 generates a Workers-style wrangler.json that has issues with Pages:
 * - SESSION KV binding without an id (auto-provisioning not supported in Pages)
 * - ASSETS binding name is reserved in Pages
 * - Empty triggers object is invalid
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const wranglerJsonPath = resolve('dist/server/wrangler.json');

if (!existsSync(wranglerJsonPath)) {
  console.log('[fix-wrangler-json] No dist/server/wrangler.json found, skipping.');
  process.exit(0);
}

const config = JSON.parse(readFileSync(wranglerJsonPath, 'utf-8'));

// Remove KV namespaces without ids (auto-provisioned, not supported in Pages)
if (config.kv_namespaces) {
  config.kv_namespaces = config.kv_namespaces.filter((ns) => ns.id);
}

// Remove reserved ASSETS binding
if (config.assets?.binding === 'ASSETS') {
  delete config.assets;
}

// Fix empty triggers object
if (config.triggers && Object.keys(config.triggers).length === 0) {
  delete config.triggers;
}

writeFileSync(wranglerJsonPath, JSON.stringify(config));
console.log('[fix-wrangler-json] Fixed wrangler.json for Pages compatibility.');
