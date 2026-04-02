/**
 * Node Function: Test Included Files
 * 
 * Reads files that should be available via included_files configuration
 * in edgeone.json to verify the configuration is working.
 * 
 * Test URLs:
 * - /test-included-files              - Scan /var/user directory tree (debug)
 * - /test-included-files?file=config.json
 * - /test-included-files?file=data.md
 * - /test-included-files?file=secret.txt
 * - /test-included-files?file=metadata.json
 */

import fs from 'node:fs';
import path from 'node:path';

// File mapping: filename -> { dir, file }
const FILE_MAP = {
  'config.json': { dir: 'assets', file: 'config.json' },
  'data.md': { dir: 'assets', file: 'data.md' },
  'secret.txt': { dir: 'assets2', file: 'secret.txt' },
  'metadata.json': { dir: 'assets2', file: 'metadata.json' },
};

/**
 * Recursively scan a directory, returning a tree structure
 * maxDepth limits recursion to avoid huge output
 */
function scanDir(dirPath, maxDepth = 4, currentDepth = 0) {
  if (currentDepth >= maxDepth) return '[max depth reached]';
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = {};
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        result[entry.name + '/'] = scanDir(fullPath, maxDepth, currentDepth + 1);
      } else {
        try {
          const stat = fs.statSync(fullPath);
          result[entry.name] = `${stat.size} bytes`;
        } catch {
          result[entry.name] = 'file';
        }
      }
    }
    return result;
  } catch (e) {
    return `[error: ${e.message}]`;
  }
}

function tryReadFile(dir, file) {
  const relativePath = `${dir}/${file}`;
  const publicRelativePath = `public/${dir}/${file}`;
  const cwd = process.cwd();
  
  // Generate all possible candidate paths
  // Runtime puts included_files under /var/user/included_files/<original_path>
  const includedFilesPublic = `included_files/public/${dir}/${file}`;
  const includedFilesDirect = `included_files/${dir}/${file}`;
  
  const candidates = [
    // ★ Most likely: /var/user/included_files/public/assets/xxx
    path.resolve(cwd, includedFilesPublic),
    path.resolve(cwd, includedFilesDirect),
    // Also try relative
    includedFilesPublic,
    includedFilesDirect,
    // With public/ prefix
    publicRelativePath,
    `/var/user/${publicRelativePath}`,
    path.resolve(cwd, publicRelativePath),
    // Direct relative
    relativePath,
    `/var/user/${relativePath}`,
    path.resolve(cwd, relativePath),
  ];

  // Deduplicate resolved paths
  const seen = new Set();
  const triedPaths = [];

  for (const candidate of candidates) {
    try {
      const resolved = path.resolve(candidate);
      if (seen.has(resolved)) continue;
      seen.add(resolved);
      triedPaths.push({ candidate, resolved });
      if (fs.existsSync(resolved)) {
        const content = fs.readFileSync(resolved, 'utf-8');
        return { found: true, path: resolved, originalCandidate: candidate, content, triedPaths };
      }
    } catch (e) {
      triedPaths.push({ candidate, error: e.message });
    }
  }

  return { found: false, triedPaths };
}

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file');

  // Common environment info for all responses
  const envInfo = {
    cwd: process.cwd(),
    dirname: import.meta.url,
    dirnameResolved: (() => {
      try { return path.dirname(new URL(import.meta.url).pathname); } catch { return 'N/A'; }
    })(),
    platform: process.platform,
    nodeVersion: process.version,
  };

  if (!fileName) {
    // Full directory scan for debugging
    const dirTree = {};
    const scanRoots = ['/var/user', '/var', '/tmp'];
    for (const root of scanRoots) {
      dirTree[root] = scanDir(root, 3);
    }

    return new Response(JSON.stringify({
      success: true,
      message: '📂 Directory scan (no ?file= param — showing filesystem for debug)',
      availableFiles: Object.keys(FILE_MAP),
      hint: 'Usage: /test-included-files?file=config.json',
      environment: envInfo,
      directoryTree: dirTree,
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  const fileInfo = FILE_MAP[fileName];

  if (!fileInfo) {
    return new Response(JSON.stringify({
      success: false,
      message: `Unknown file: ${fileName}`,
      availableFiles: Object.keys(FILE_MAP)
    }, null, 2), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const result = tryReadFile(fileInfo.dir, fileInfo.file);

  const configInfo = {
    includeFiles: ['public/assets/**', 'public/assets2/**'],
    configuredIn: 'edgeone.json → node-functions.included_files (旧格式生效)',
    runtimeBasePath: '/var/user/included_files/',
    note: '文件落地在 /var/user/included_files/<included_files配置路径>'
  };

  if (result.found) {
    let parsedContent = result.content;
    if (fileName.endsWith('.json')) {
      try {
        parsedContent = JSON.parse(result.content);
      } catch (e) {
        // keep as string
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `✅ Successfully read ${fileName} via included_files`,
      file: {
        name: fileName,
        resolvedPath: result.path,
        candidate: result.originalCandidate,
        content: parsedContent,
        size: result.content.length
      },
      config: configInfo,
      environment: envInfo,
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  // File not found — also scan directories to show where files actually are
  const dirTree = scanDir('/var/user', 3);

  return new Response(JSON.stringify({
    success: false,
    message: `❌ File not found: ${fileName}`,
    triedPaths: result.triedPaths,
    hint: 'Check the directoryTree below to see where files actually exist in runtime',
    config: configInfo,
    environment: envInfo,
    directoryTree: { '/var/user': dirTree },
  }, null, 2), {
    status: 404,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
