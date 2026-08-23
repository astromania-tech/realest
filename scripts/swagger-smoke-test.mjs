#!/usr/bin/env node
// Simple smoke tester for OpenAPI paths — non-destructive.
// Usage: node scripts/swagger-smoke-test.mjs <BEARER_TOKEN>

import { loadJwtToken } from './jwt-auth.mjs';

const REPLACE_PARAM = 'test-id';
const TIMEOUT_MS = 15000;

async function timeout(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sanitizePath(path) {
  return path.replace(/{[^}]+}/g, REPLACE_PARAM);
}

(async function main() {
  try {
    const token = await loadJwtToken({
      label: 'swagger smoke test',
      argvValue: process.argv[2],
      envNames: ['REALEST_ADMIN_JWT', 'SUPABASE_ADMIN_JWT', 'SUPABASE_ACCESS_TOKEN'],
    });

    const specUrl = 'http://localhost:3000/api/docs/openapi.json';
    console.log('Fetching OpenAPI spec from', specUrl);
    const res = await fetch(specUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch spec: ${res.status} ${res.statusText}`);
    const spec = await res.json();
    const server = (spec.servers && spec.servers[0] && spec.servers[0].url) || 'http://localhost:3000';

    const paths = Object.keys(spec.paths || {});
    console.log(`Found ${paths.length} paths in spec`);

    const results = [];
    for (const p of paths) {
      const methods = Object.keys(spec.paths[p]);
      for (const m of methods) {
        const method = m.toUpperCase();
        const url = server.replace(/\/$/, '') + sanitizePath(p);
        // For safety: only do real GET requests; other methods -> OPTIONS probe
        const probeMethod = method === 'GET' || method === 'HEAD' ? method : 'OPTIONS';
        const start = Date.now();
        let ok = false, status = null, statusText = '', bodySnippet = '', ct = '';
        try {
          const r = await fetch(url, {
            method: probeMethod,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'x-smoke-test': 'true'
            },
            // don't send body for non-GET probes
          });
          status = r.status; statusText = r.statusText; ct = r.headers.get('content-type') || '';
          ok = r.ok;
          try {
            const text = await r.text();
            bodySnippet = text ? text.slice(0, 500) : '';
          } catch (e) {
            bodySnippet = '<no body/failed to read>';
          }
        } catch (err) {
          statusText = String(err.message || err);
        }
        const elapsed = Date.now() - start;
        const entry = { path: p, method, probeMethod, url, status, statusText, ok, ct, elapsed, bodySnippet };
        console.log(`[${entry.probeMethod}] ${entry.url} -> ${entry.status} ${entry.statusText} (${entry.elapsed}ms)`);
        results.push(entry);
        // small delay to avoid hammering
        await timeout(120);
      }
    }

    // Summarize
    const summary = results.reduce((acc, r) => {
      if (!acc.byStatus[r.status]) acc.byStatus[r.status] = 0;
      acc.byStatus[r.status] += 1;
      if (!r.ok) acc.failures.push(r);
      return acc;
    }, { total: results.length, byStatus: {}, failures: [] });

    console.log('\nSmoke test complete. Summary:');
    console.log(`Total checks: ${summary.total}`);
    console.log('By status:', summary.byStatus);
    console.log(`Failures: ${summary.failures.length}`);

    if (summary.failures.length) {
      console.log('\nFailures (first 20):');
      for (const f of summary.failures.slice(0, 20)) {
        console.log(`- ${f.method} ${f.path} => ${f.status} ${f.statusText} (${f.probeMethod})`);
      }
    }

    // Save results to file in project for inspection
    // Save results to file (Node)
    try {
      const fs = await import('fs');
      fs.writeFileSync(process.cwd() + '/scripts/swagger-smoke-results.json', JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
      console.log('Saved results to scripts/swagger-smoke-results.json');
    } catch (e) {
      console.warn('Failed to write results file:', e?.message || e);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during smoke test:', err);
    process.exit(1);
  }
})();
