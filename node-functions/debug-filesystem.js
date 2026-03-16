/**
 * Node Function: Debug Filesystem
 * 
 * Recursively scans the runtime environment to help debug
 * included_files configuration.
 * 
 * Test URL: /debug-filesystem
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively scan a directory and return a flat list of file paths
 */
function scanDirFlat(dirPath, maxDepth = 5, currentDepth = 0, prefix = '') {
  const files = [];
  if (currentDepth >= maxDepth) return files;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const displayPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files.push({ path: displayPath + '/', type: 'dir' });
        files.push(...scanDirFlat(fullPath, maxDepth, currentDepth + 1, displayPath));
      } else {
        try {
          const stat = fs.statSync(fullPath);
          files.push({ path: displayPath, type: 'file', size: stat.size });
        } catch {
          files.push({ path: displayPath, type: 'file' });
        }
      }
    }
  } catch (e) {
    files.push({ path: prefix || dirPath, type: 'error', error: e.message });
  }
  return files;
}

export function onRequest(context) {
  const cwd = process.cwd();
  let dirnameResolved = 'N/A';
  try { dirnameResolved = path.dirname(new URL(import.meta.url).pathname); } catch {}

  const results = {
    success: true,
    message: '🔍 EdgeOne Runtime Filesystem Debug',
    environment: {
      cwd,
      dirname: import.meta.url,
      dirnameResolved,
      platform: process.platform,
      nodeVersion: process.version,
      env_keys: Object.keys(process.env).sort(),
    },
    scans: {}
  };

  // Scan key directories
  const scanTargets = ['/var/user', '/var', '/tmp'];
  
  for (const target of scanTargets) {
    try {
      if (fs.existsSync(target)) {
        const depth = target === '/var/user' ? 5 : 2;
        results.scans[target] = scanDirFlat(target, depth);
      } else {
        results.scans[target] = 'does not exist';
      }
    } catch (e) {
      results.scans[target] = `error: ${e.message}`;
    }
  }

  // Quick checks for expected included_files paths
  const expectedPaths = [
    'assets/config.json',
    'assets/data.md',
    'assets2/secret.txt',
    'assets2/metadata.json',
  ];

  results.includedFilesCheck = {};
  for (const ep of expectedPaths) {
    const abs = path.resolve(cwd, ep);
    results.includedFilesCheck[ep] = {
      resolvedPath: abs,
      exists: fs.existsSync(abs),
    };
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
