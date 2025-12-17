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
import { join } from 'path';

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file') || 'config.json';
  
  try {
    // Determine which directory to read from
    const assetDir = fileName.includes('secret.txt') || fileName.includes('metadata.json') 
      ? 'assets2' 
      : 'assets';
    
    // Try multiple possible paths to support different environments:
    // 1. Local development (files in public/)
    // 2. EdgeOne Pages deployment (files in dist/, included via included_files)
    // 3. Alternative deployment paths
    const possiblePaths = [
      join(process.cwd(), assetDir, fileName),             // EdgeOne deployed: dist/assets/**
      join(process.cwd(), 'public', assetDir, fileName),  // Local dev: public/assets/**
      join(process.cwd(), 'dist', assetDir, fileName),    // Built output: dist/assets/**
      join('/tmp', assetDir, fileName),                    // Alternative location
    ];
    
    let filePath = null;
    let searchedPaths = [];
    
    // Try each possible path
    for (const path of possiblePaths) {
      searchedPaths.push(path);
      if (existsSync(path)) {
        filePath = path;
        break;
      }
    }
    
    // Check if file exists
    if (!filePath) {
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
    
    // Read file content
    const content = readFileSync(filePath, 'utf-8');
    
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
      filePath,
      contentType,
      content,
      message: '✅ Successfully read file via included_files configuration'
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
