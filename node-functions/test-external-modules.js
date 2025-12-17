/**
 * Node Function: Test external_node_modules configuration
 * 
 * This function tests the ability to use external npm packages
 * configured in edgeone.json
 * 
 * Test URLs:
 * - /test-external-modules (GET) - Test all external modules
 * - /test-external-modules?module=koa (GET) - Test specific module
 */

import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from '@koa/bodyparser';
import koaJson from 'koa-json';
import compose from 'koa-compose';
import svgCaptcha from 'svg-captcha';

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const testModule = url.searchParams.get('module');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  try {
    // Test 1: Koa
    if (!testModule || testModule === 'koa') {
      try {
        const app = new Koa();
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
        const router = new Router();
        router.get('/test', (ctx) => {
          ctx.body = 'test';
        });
        results.tests['@koa/router'] = {
          success: true,
          routes: router.stack.length,
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
    
    return new Response(JSON.stringify({
      success: allPassed,
      message: allPassed 
        ? '✅ All external modules working correctly!' 
        : '⚠️ Some modules failed. Check edgeone.json configuration.',
      ...results
    }, null, 2), {
      status: allPassed ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Failed to test external modules. Check external_node_modules in edgeone.json'
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
