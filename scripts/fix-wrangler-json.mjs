/**
 * Post-build script to fix the generated wrangler.json for Cloudflare Pages compatibility.
 *
 * @astrojs/cloudflare v13 generates a Workers-style wrangler.json that has fields
 * incompatible with Pages deployments. This script removes them.
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

// Remove fields not supported by Pages
const unsupportedPageFields = [
  'main',
  'rules',
  'no_bundle',
  'triggers',
  'definedEnvironments',
  'secrets_store_secrets',
  'unsafe_hello_world',
  'worker_loaders',
  'ratelimits',
  'vpc_services',
  'python_modules',
];

for (const field of unsupportedPageFields) {
  delete config[field];
}

// Clean up dev fields not supported by Pages
if (config.dev) {
  delete config.dev.enable_containers;
  delete config.dev.generate_types;
}

writeFileSync(wranglerJsonPath, JSON.stringify(config));
console.log('[fix-wrangler-json] Fixed wrangler.json for Pages compatibility.');
