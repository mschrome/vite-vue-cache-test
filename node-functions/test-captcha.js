/**
 * Node Function: Generate SVG Captcha
 * 
 * This function generates a captcha using svg-captcha package
 * to test external_node_modules configuration
 * 
 * Test URLs:
 * - /test-captcha (GET) - Generate and return SVG captcha
 * - /test-captcha?size=6 (GET) - Generate captcha with custom size
 * - /test-captcha?type=math (GET) - Generate math captcha
 */

import svgCaptcha from 'svg-captcha';

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const size = parseInt(url.searchParams.get('size')) || 4;
  const type = url.searchParams.get('type') || 'text';
  const format = url.searchParams.get('format') || 'svg'; // 'svg' or 'json'
  
  try {
    let captcha;
    
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
    
    // Return as SVG image
    if (format === 'svg') {
      return new Response(captcha.data, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Captcha-Text': captcha.text // For testing only, remove in production
        }
      });
    }
    
    // Return as JSON
    return new Response(JSON.stringify({
      success: true,
      captcha: {
        svg: captcha.data,
        text: captcha.text, // For testing only, remove in production
        type: type,
        size: size
      },
      message: '✅ SVG Captcha generated via svg-captcha external module',
      config: {
        external_node_modules: ['svg-captcha'],
        configuredIn: 'edgeone.json'
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
      message: 'Failed to generate captcha. Check svg-captcha in external_node_modules'
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
