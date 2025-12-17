/**
 * EdgeOne Pages Node Function - Koa Application
 * 
 * This is a unified Koa application that combines:
 * 1. External modules testing functionality
 * 2. Complete Koa server with routing examples
 * 
 * Routes:
 * - GET  /koa                          - Server info
 * - GET  /koa/test-modules             - Test all external modules
 * - GET  /koa/test-modules?module=xxx  - Test specific module
 * - GET  /koa/api/hello                - Hello endpoint
 * - POST /koa/api/echo                 - Echo request body
 * - GET  /koa/api/config               - Configuration info
 */

import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from '@koa/bodyparser';
import koaJson from 'koa-json';
import compose from 'koa-compose';
import svgCaptcha from 'svg-captcha';

// Initialize Koa app and router
const app = new Koa();
const router = new Router();

// ==================== Routes ====================

// Root route - Server info
router.get('/', (ctx) => {
  ctx.body = {
    success: true,
    message: '✅ Koa server running with external modules',
    server: 'EdgeOne Pages Node Function',
    framework: 'Koa',
    modules: [
      'koa',
      '@koa/router',
      '@koa/bodyparser',
      'koa-json',
      'koa-compose',
      'svg-captcha'
    ],
    routes: [
      'GET  /',
      'GET  /test-modules',
      'GET  /test-modules?module=xxx',
      'GET  /api/hello',
      'POST /api/echo',
      'GET  /api/config'
    ],
    timestamp: new Date().toISOString()
  };
});

// Test external modules route
router.get('/test-modules', async (ctx) => {
  const testModule = ctx.query.module;
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  try {
    // Test 1: Koa
    if (!testModule || testModule === 'koa') {
      try {
        const testApp = new Koa();
        results.tests.koa = {
          success: true,
          version: 'imported',
          message: '✅ Koa imported successfully'
        };
      } catch (err) {
        results.tests.koa = {
          success: false,
          error: err.message
        };
      }
    }
    
    // Test 2: @koa/router
    if (!testModule || testModule === 'router') {
      try {
        const testRouter = new Router();
        testRouter.get('/test', (ctx) => {
          ctx.body = 'test';
        });
        results.tests['@koa/router'] = {
          success: true,
          routes: testRouter.stack.length,
          message: '✅ @koa/router imported and configured'
        };
      } catch (err) {
        results.tests['@koa/router'] = {
          success: false,
          error: err.message
        };
      }
    }
    
    // Test 3: @koa/bodyparser
    if (!testModule || testModule === 'bodyparser') {
      try {
        const parser = bodyParser();
        results.tests['@koa/bodyparser'] = {
          success: true,
          type: typeof parser,
          message: '✅ @koa/bodyparser imported successfully'
        };
      } catch (err) {
        results.tests['@koa/bodyparser'] = {
          success: false,
          error: err.message
        };
      }
    }
    
    // Test 4: koa-json
    if (!testModule || testModule === 'json') {
      try {
        const jsonMiddleware = koaJson();
        results.tests['koa-json'] = {
          success: true,
          type: typeof jsonMiddleware,
          message: '✅ koa-json imported successfully'
        };
      } catch (err) {
        results.tests['koa-json'] = {
          success: false,
          error: err.message
        };
      }
    }
    
    // Test 5: koa-compose
    if (!testModule || testModule === 'compose') {
      try {
        const middleware = compose([
          async (ctx, next) => { await next(); },
          async (ctx, next) => { await next(); }
        ]);
        results.tests['koa-compose'] = {
          success: true,
          type: typeof middleware,
          message: '✅ koa-compose imported and working'
        };
      } catch (err) {
        results.tests['koa-compose'] = {
          success: false,
          error: err.message
        };
      }
    }
    
    // Test 6: svg-captcha
    if (!testModule || testModule === 'captcha') {
      try {
        const captcha = svgCaptcha.create({
          size: 4,
          noise: 2,
          color: true
        });
        results.tests['svg-captcha'] = {
          success: true,
          hasSvg: captcha.data.includes('<svg'),
          textLength: captcha.text.length,
          message: '✅ svg-captcha generated successfully'
        };
      } catch (err) {
        results.tests['svg-captcha'] = {
          success: false,
          error: err.message
        };
      }
    }
    
    // Summary
    const totalTests = Object.keys(results.tests).length;
    const passedTests = Object.values(results.tests).filter(t => t.success).length;
    
    results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: `${((passedTests / totalTests) * 100).toFixed(2)}%`
    };
    
    const allPassed = passedTests === totalTests;
    
    ctx.status = allPassed ? 200 : 500;
    ctx.body = {
      success: allPassed,
      message: allPassed 
        ? '✅ All external modules working correctly!' 
        : '⚠️ Some modules failed. Check edgeone.json configuration.',
      ...results
    };
    
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Failed to test external modules. Check external_node_modules in edgeone.json'
    };
  }
});

// API: Hello endpoint
router.get('/api/hello', (ctx) => {
  ctx.body = {
    success: true,
    message: 'Hello from Koa Router!',
    route: '/api/hello',
    method: ctx.method,
    timestamp: new Date().toISOString()
  };
});

// API: Echo endpoint (POST)
router.post('/api/echo', (ctx) => {
  ctx.body = {
    success: true,
    message: 'Echo endpoint',
    received: ctx.request.body,
    headers: ctx.request.headers,
    method: ctx.method,
    timestamp: new Date().toISOString()
  };
});

// API: Config endpoint
router.get('/api/config', (ctx) => {
  ctx.body = {
    success: true,
    edgeoneConfig: {
      'node-function': {
        'included_files': [
          'assets/**',
          'assets2/**'
        ],
        'external_node_modules': [
          'koa',
          '@koa/router',
          '@koa/bodyparser',
          'koa-json',
          'koa-compose',
          'svg-captcha'
        ]
      },
      'configFile': 'edgeone.json'
    },
    middleware: [
      'koa-json (JSON pretty print)',
      '@koa/bodyparser (Body parsing)',
      '@koa/router (Routing)',
      'koa-compose (Middleware composition)'
    ],
    timestamp: new Date().toISOString()
  };
});

// ==================== Middleware Setup ====================

// Compose all middleware
const middleware = compose([
  // JSON pretty print
  koaJson({ pretty: true, spaces: 2 }),
  
  // Body parser
  bodyParser({
    enableTypes: ['json', 'form', 'text'],
    jsonLimit: '10mb'
  }),
  
  // Router
  router.routes(),
  router.allowedMethods()
]);

app.use(middleware);

// ==================== Error Handling ====================

app.on('error', (err, ctx) => {
  console.error('Koa server error:', err);
});

// ==================== Export ====================

// EdgeOne Pages requires exporting the app as default
export default app;
