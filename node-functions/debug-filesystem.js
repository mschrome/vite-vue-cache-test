/**
 * Node Function: Debug Filesystem
 * 
 * This function helps debug the filesystem structure in Node Functions
 * to understand where included_files are actually placed
 * 
 * Test URL:
 * - /debug-filesystem (GET) - Show filesystem structure
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

function listDirectory(dirPath, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return null;
  
  try {
    if (!existsSync(dirPath)) {
      return { error: 'Directory does not exist' };
    }
    
    const items = readdirSync(dirPath);
    const result = {};
    
    for (const item of items) {
      // Skip node_modules and hidden files
      if (item === 'node_modules' || item.startsWith('.')) continue;
      
      const itemPath = join(dirPath, item);
      try {
        const stats = statSync(itemPath);
        
        if (stats.isDirectory()) {
          result[item + '/'] = listDirectory(itemPath, depth + 1, maxDepth);
        } else {
          result[item] = {
            size: stats.size,
            type: 'file'
          };
        }
      } catch (err) {
        result[item] = { error: err.message };
      }
    }
    
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

export function onRequest(context) {
  try {
    const cwd = process.cwd();
    
    // Check various important paths
    const pathsToCheck = [
      { path: cwd, name: 'Current Working Directory (cwd)' },
      { path: join(cwd, 'assets'), name: 'assets/' },
      { path: join(cwd, 'assets2'), name: 'assets2/' },
      { path: join(cwd, 'public'), name: 'public/' },
      { path: join(cwd, 'public', 'assets'), name: 'public/assets/' },
      { path: join(cwd, 'public', 'assets2'), name: 'public/assets2/' },
      { path: '/tmp/assets', name: '/tmp/assets/' },
      { path: '/tmp/assets2', name: '/tmp/assets2/' },
    ];
    
    const pathChecks = {};
    for (const { path, name } of pathsToCheck) {
      pathChecks[name] = {
        path: path,
        exists: existsSync(path),
        contents: existsSync(path) ? readdirSync(path).slice(0, 20) : null
      };
    }
    
    // Get directory structure of cwd
    const cwdStructure = listDirectory(cwd, 0, 2);
    
    return new Response(JSON.stringify({
      success: true,
      message: '🔍 Filesystem Debug Information',
      environment: {
        cwd: cwd,
        platform: process.platform,
        nodeVersion: process.version,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          PWD: process.env.PWD,
        }
      },
      pathChecks: pathChecks,
      cwdStructure: cwdStructure,
      recommendations: [
        'Files in included_files should be accessible from one of the checked paths',
        'In local development, files are usually in public/assets/',
        'In deployed environment, files might be in assets/ (root level)',
        'Update edgeone.json if files are not found'
      ]
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Failed to debug filesystem'
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
