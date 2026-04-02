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
    message: '🔍 EdgeOne Runtime Filesystem Debug v2',
    environment: {
      cwd,
      dirname: import.meta.url,
      dirnameResolved,
      platform: process.platform,
      nodeVersion: process.version,
    },
    // Read meta.json to understand build config
    metaJson: null,
    scans: {},
    // Exhaustive search for assets files
    assetsSearch: {},
  };

  // 1. Read meta.json
  try {
    const metaPath = path.resolve(cwd, 'meta.json');
    if (fs.existsSync(metaPath)) {
      results.metaJson = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }
  } catch (e) {
    results.metaJson = `error: ${e.message}`;
  }

  // 2. Scan /var/user deeply (up to 6 levels), skip node_modules internals
  try {
    results.scans['/var/user'] = scanDirFlat('/var/user', 6);
    // Filter out deep node_modules to keep output manageable
    results.scans['/var/user'] = results.scans['/var/user'].filter(f => {
      const parts = f.path.split('/');
      const nmIdx = parts.indexOf('node_modules');
      // Keep node_modules top-level entries, skip deeper
      if (nmIdx >= 0 && parts.length > nmIdx + 2) return false;
      return true;
    });
  } catch (e) {
    results.scans['/var/user'] = `error: ${e.message}`;
  }

  // 3. Exhaustive search for assets in many possible locations
  const searchRoots = [
    '/var/user',
    '/var/user/node_modules',
    '/var',
    '/tmp',
    '/opt',
    cwd,
    dirnameResolved,
    path.resolve(cwd, '..'),
    path.resolve(cwd, '../..'),
  ];

  const assetNames = ['assets', 'public', 'assets2', 'dist', 'static', '_assets'];
  
  for (const root of searchRoots) {
    try {
      if (!fs.existsSync(root)) continue;
      const entries = fs.readdirSync(root);
      const matches = entries.filter(e => 
        assetNames.some(name => e.toLowerCase().includes(name)) ||
        e === 'config.json' || e === 'data.md' || e === 'secret.txt' || e === 'metadata.json'
      );
      if (matches.length > 0) {
        results.assetsSearch[root] = matches.map(m => {
          const full = path.join(root, m);
          try {
            const stat = fs.statSync(full);
            return { name: m, isDir: stat.isDirectory(), size: stat.size };
          } catch {
            return { name: m, error: 'stat failed' };
          }
        });
      }
    } catch (e) {
      // skip unreadable dirs
    }
  }

  // 4. Check specific candidate paths for config.json
  const candidatePaths = [
    // Direct
    '/var/user/assets/config.json',
    '/var/user/public/assets/config.json',
    '/var/user/dist/assets/config.json',
    // Relative to various bases
    path.resolve(cwd, 'assets/config.json'),
    path.resolve(cwd, 'public/assets/config.json'),
    path.resolve(cwd, 'dist/assets/config.json'),
    path.resolve(cwd, '../assets/config.json'),
    path.resolve(cwd, '../public/assets/config.json'),
    path.resolve(cwd, '../../assets/config.json'),
    path.resolve(cwd, '../../public/assets/config.json'),
    // Relative to dirname
    path.resolve(dirnameResolved, 'assets/config.json'),
    path.resolve(dirnameResolved, 'public/assets/config.json'),
    path.resolve(dirnameResolved, '../assets/config.json'),
    path.resolve(dirnameResolved, '../../assets/config.json'),
    // Misc
    '/tmp/assets/config.json',
    '/opt/assets/config.json',
  ];

  results.candidatePathChecks = {};
  for (const cp of candidatePaths) {
    results.candidatePathChecks[cp] = fs.existsSync(cp);
  }

  // 5. List /var/user/node_modules top-level packages (just names)
  try {
    const nmPath = '/var/user/node_modules';
    if (fs.existsSync(nmPath)) {
      const pkgs = fs.readdirSync(nmPath);
      results.nodeModulesTopLevel = pkgs.slice(0, 50); // limit to 50
      results.nodeModulesCount = pkgs.length;
    }
  } catch (e) {
    results.nodeModulesTopLevel = `error: ${e.message}`;
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
