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

// Note: __dirname is automatically provided by EdgeOne Pages build system
// No need to import fileURLToPath or create __dirname manually

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file') || 'config.json';
  
  try {
    // Determine which directory to read from
    const assetDir = fileName.includes('secret.txt') || fileName.includes('metadata.json') 
      ? 'assets2' 
      : 'assets';
    
    // Try multiple possible paths using relative paths:
    // 1. Relative to current function directory (cloud deployment with included_files)
    // 2. Relative to project root via ../public (local development)
    // 3. Relative to project root via ../dist (built output)
    const possiblePaths = [
      // Cloud deployment: included_files copies to same level as functions
      join(__dirname, '..', assetDir, fileName),
      
      // Local development: files in public/
      join(__dirname, '..', 'public', assetDir, fileName),
      
      // Built output: files in dist/
      join(__dirname, '..', 'dist', assetDir, fileName),
      
      // Alternative: directly in parent directory
      join(__dirname, assetDir, fileName),
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
