/**
 * Node Function: Debug Filesystem
 * 
 * Lists and checks paths in the runtime environment
 * to help debug included_files configuration
 * 
 * Test URL: /debug-filesystem
 */

import fs from 'node:fs';
import path from 'node:path';

export function onRequest(context) {
  const results = {
    success: true,
    message: 'Filesystem debug info',
    environment: {
      cwd: process.cwd(),
      dirname: import.meta.url,
      platform: process.platform,
      nodeVersion: process.version
    },
    pathChecks: {}
  };

  // Paths to check - relative to the function's working directory
  const pathsToCheck = {
    'cwd': '.',
    'assets': 'assets',
    'assets2': 'assets2',
    'public': 'public',
    'public/assets': 'public/assets',
    'public/assets2': 'public/assets2',
    '/var/user': '/var/user',
    '/var/user/assets': '/var/user/assets',
    '/var/user/assets2': '/var/user/assets2',
  };

  for (const [name, checkPath] of Object.entries(pathsToCheck)) {
    try {
      const resolvedPath = path.resolve(checkPath);
      const exists = fs.existsSync(resolvedPath);
      const info = {
        path: resolvedPath,
        exists
      };

      if (exists) {
        const stats = fs.statSync(resolvedPath);
        info.isDirectory = stats.isDirectory();
        info.isFile = stats.isFile();

        if (stats.isDirectory()) {
          try {
            info.contents = fs.readdirSync(resolvedPath).slice(0, 20);
          } catch (e) {
            info.contents = [`Error reading dir: ${e.message}`];
          }
        } else if (stats.isFile()) {
          info.size = stats.size;
        }
      }

      results.pathChecks[name] = info;
    } catch (error) {
      results.pathChecks[name] = {
        path: checkPath,
        exists: false,
        error: error.message
      };
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
