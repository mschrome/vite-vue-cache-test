/**
 * Node Function: Test included_files configuration
 * 
 * This function tests the ability to read files from included_files
 * configured in edgeone.json
 * 
 * Test URLs:
 * - /test-included-files (GET) - Read config.json from assets/
 * - /test-included-files?file=data.md (GET) - Read data.md from assets/
 * - /test-included-files?file=secret.txt (GET) - Read secret.txt from assets2/
 * - /test-included-files?file=metadata.json (GET) - Read metadata.json from assets2/
 */

import { readFileSync, existsSync } from 'fs';

// Use ES module URL-based relative paths
// No need for __dirname, join, or fileURLToPath!

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file') || 'config.json';
  
  try {
    // Determine which directory to read from
    const assetDir = fileName.includes('secret.txt') || fileName.includes('metadata.json') 
      ? 'assets2' 
      : 'assets';
    
    // Try multiple possible paths using URL-based relative paths
    // Note: In dev mode, functions are compiled to .edgeone/node-functions/
    // So we need to go up 2 levels to reach project root
    const possibleUrls = [
      // Local dev: from .edgeone/node-functions/ to public/assets/
      new URL(`../../public/${assetDir}/${fileName}`, import.meta.url),
      
      // Cloud deployment: from node-functions/ to assets/ (included_files)
      new URL(`../${assetDir}/${fileName}`, import.meta.url),
      
      // Built output: from .edgeone/node-functions/ to dist/assets/
      new URL(`../../dist/${assetDir}/${fileName}`, import.meta.url),
      
      // Alternative: from node-functions/ to public/assets/
      new URL(`../public/${assetDir}/${fileName}`, import.meta.url),
      
      // Direct: same level as functions
      new URL(`./${assetDir}/${fileName}`, import.meta.url),
    ];
    
    let fileUrl = null;
    let searchedPaths = [];
    
    // Try each possible URL
    for (const urlObj of possibleUrls) {
      const pathStr = urlObj.pathname;
      searchedPaths.push(pathStr);
      
      // Check if file exists (need to use pathname for existsSync)
      if (existsSync(urlObj)) {
        fileUrl = urlObj;
        break;
      }
    }
    
    // Check if file exists
    if (!fileUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'File not found',
        requestedFile: fileName,
        searchedPaths: searchedPaths,
        message: 'Make sure included_files is configured in edgeone.json',
        tip: 'File should be in public/assets/ or public/assets2/ directory'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
    
    // Read file content (readFileSync accepts URL objects directly!)
    const content = readFileSync(fileUrl, 'utf-8');
    
    // Determine content type
    let contentType = 'text/plain';
    if (fileName.endsWith('.json')) {
      contentType = 'application/json';
    } else if (fileName.endsWith('.md')) {
      contentType = 'text/markdown';
    }
    
    return new Response(JSON.stringify({
      success: true,
      fileName,
      filePath: fileUrl.pathname,
      fileUrl: fileUrl.href,
      contentType,
      content,
      fileSize: content.length,
      message: '✅ Successfully read file via URL-based relative paths'
    }), {
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
      message: 'Failed to read file. Check included_files configuration in edgeone.json'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
