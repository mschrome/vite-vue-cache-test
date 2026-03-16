/**
 * Node Function: Generate SVG Captcha
 * 
 * This function generates a captcha using svg-captcha package
 * to test externalNodeModules configuration
 * 
 * Test URLs:
 * - /test-captcha (GET) - Generate and return SVG captcha
 * - /test-captcha?size=6 (GET) - Generate captcha with custom size
 * - /test-captcha?type=math (GET) - Generate math captcha
 */

import svgCaptcha from 'svg-captcha';
import fs from 'node:fs';
import path from 'node:path';

// Try to locate and load the font file that svg-captcha needs
let fontLoaded = false;
let fontLoadError = null;

try {
  // svg-captcha expects Comismsh.ttf in its own fonts directory
  // In EdgeOne runtime, we need to find the correct path
  const possibleFontPaths = [
    // Standard node_modules paths
    path.join(process.cwd(), 'node_modules', 'svg-captcha', 'fonts', 'Comismsh.ttf'),
    // EdgeOne runtime paths
    '/var/user/node_modules/svg-captcha/fonts/Comismsh.ttf',
    '/var/fonts/Comismsh.ttf',
  ];

  for (const fontPath of possibleFontPaths) {
    if (fs.existsSync(fontPath)) {
      svgCaptcha.loadFont(fontPath);
      fontLoaded = true;
      break;
    }
  }
} catch (e) {
  fontLoadError = e.message;
}

/**
 * Fallback: generate a simple SVG captcha without relying on external fonts
 */
function generateFallbackCaptcha(size = 4, type = 'text') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let text = '';
  if (type === 'math') {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    text = `${a}+${b}`;
    var answer = String(a + b);
  } else {
    for (let i = 0; i < size; i++) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    var answer = text;
  }

  const width = 150;
  const height = 50;
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  let svgChars = '';
  for (let i = 0; i < text.length; i++) {
    const x = 20 + i * (120 / text.length);
    const y = 30 + Math.random() * 10;
    const rotate = Math.floor(Math.random() * 30) - 15;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const fontSize = 24 + Math.floor(Math.random() * 8);
    svgChars += `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="sans-serif" transform="rotate(${rotate}, ${x}, ${y})">${text[i]}</text>`;
  }

  // Add some noise lines
  let noiseLines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1" opacity="0.5"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    ${noiseLines}
    ${svgChars}
  </svg>`;

  return { data: svg, text: answer };
}

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const size = parseInt(url.searchParams.get('size')) || 4;
  const type = url.searchParams.get('type') || 'text';
  const format = url.searchParams.get('format') || 'svg'; // 'svg' or 'json'
  
  try {
    let captcha;
    let usedFallback = false;

    try {
      // First try svg-captcha with font
      if (type === 'math') {
        captcha = svgCaptcha.createMathExpr({
          mathMin: 1,
          mathMax: 9,
          noise: 2,
          color: true
        });
      } else {
        captcha = svgCaptcha.create({
          size: size,
          noise: 3,
          color: true,
          background: '#f0f0f0'
        });
      }
    } catch (svgError) {
      // Font not found or other svg-captcha error → use fallback
      captcha = generateFallbackCaptcha(size, type);
      usedFallback = true;
    }
    
    // Return as SVG image
    if (format === 'svg') {
      return new Response(captcha.data, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Captcha-Text': captcha.text, // For testing only
          'X-Used-Fallback': String(usedFallback)
        }
      });
    }
    
    // Return as JSON
    return new Response(JSON.stringify({
      success: true,
      captcha: {
        svg: captcha.data,
        text: captcha.text, // For testing only
        type: type,
        size: size
      },
      message: usedFallback
        ? '⚠️ SVG Captcha generated using fallback (svg-captcha font not available in runtime)'
        : '✅ SVG Captcha generated via svg-captcha external module',
      usedFallback,
      fontInfo: {
        fontLoaded,
        fontLoadError
      },
      config: {
        externalNodeModules: ['svg-captcha'],
        configuredIn: 'edgeone.json → node-functions.external_node_modules'
      }
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      fontInfo: {
        fontLoaded,
        fontLoadError
      },
      message: 'Failed to generate captcha. Check svg-captcha in externalNodeModules'
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
