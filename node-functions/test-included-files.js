/**
 * Node Function: Test Included Files
 * 
 * Reads files that should be available via includeFiles configuration
 * in edgeone.json to verify the configuration is working.
 * 
 * Test URLs:
 * - /test-included-files?file=config.json
 * - /test-included-files?file=data.md
 * - /test-included-files?file=secret.txt
 * - /test-included-files?file=metadata.json
 */

import fs from 'node:fs';
import path from 'node:path';

// File mapping: filename -> possible paths to try
const FILE_MAP = {
  'config.json': ['assets/config.json', 'public/assets/config.json'],
  'data.md': ['assets/data.md', 'public/assets/data.md'],
  'secret.txt': ['assets2/secret.txt', 'public/assets2/secret.txt'],
  'metadata.json': ['assets2/metadata.json', 'public/assets2/metadata.json'],
};

function tryReadFile(possiblePaths) {
  for (const p of possiblePaths) {
    // Try both relative and absolute paths
    const candidates = [
      p,
      path.resolve(p),
      path.join('/var/user', p),
      path.join(process.cwd(), p),
    ];

    for (const candidate of candidates) {
      try {
        if (fs.existsSync(candidate)) {
          const content = fs.readFileSync(candidate, 'utf-8');
          return { found: true, path: candidate, content };
        }
      } catch (e) {
        // continue to next candidate
      }
    }
  }
  return { found: false, triedPaths: possiblePaths };
}

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file');

  if (!fileName) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Missing ?file= parameter',
      availableFiles: Object.keys(FILE_MAP),
      hint: 'Usage: /test-included-files?file=config.json'
    }, null, 2), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const possiblePaths = FILE_MAP[fileName];

  if (!possiblePaths) {
    return new Response(JSON.stringify({
      success: false,
      message: `Unknown file: ${fileName}`,
      availableFiles: Object.keys(FILE_MAP)
    }, null, 2), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const result = tryReadFile(possiblePaths);

  if (result.found) {
    let parsedContent = result.content;
    // Try to parse JSON files
    if (fileName.endsWith('.json')) {
      try {
        parsedContent = JSON.parse(result.content);
      } catch (e) {
        // keep as string
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `✅ Successfully read ${fileName} via includeFiles`,
      file: {
        name: fileName,
        resolvedPath: result.path,
        content: parsedContent,
        size: result.content.length
      },
      config: {
        includeFiles: ['assets/**', 'assets2/**'],
        configuredIn: 'edgeone.json → cloudFunctions.nodejs.includeFiles'
      }
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }

  return new Response(JSON.stringify({
    success: false,
    message: `❌ File not found: ${fileName}`,
    triedPaths: possiblePaths,
    hint: 'Check that includeFiles in edgeone.json is correctly configured',
    config: {
      includeFiles: ['assets/**', 'assets2/**'],
      configuredIn: 'edgeone.json → cloudFunctions.nodejs.includeFiles'
    },
    environment: {
      cwd: process.cwd(),
      dirname: import.meta.url
    }
  }, null, 2), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
