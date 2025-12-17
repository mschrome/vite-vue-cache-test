/**
 * Node Function: Koa Server with Multiple Middleware
 * 
 * This function demonstrates a complete Koa application using
 * all configured external modules
 * 
 * Test URLs:
 * - /test-koa-server (GET) - Server info
 * - /test-koa-server/api/hello (GET) - Hello endpoint
 * - /test-koa-server/api/echo (POST) - Echo body content
 */

import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from '@koa/bodyparser';
import koaJson from 'koa-json';
import compose from 'koa-compose';

const app = new Koa();
const router = new Router();

// Configure routes
router.get('/', (ctx) => {
  ctx.body = {
    success: true,
    message: '✅ Koa server running with external modules',
    server: 'EdgeOne Pages Node Function',
    modules: [
      'koa',
      '@koa/router',
      '@koa/bodyparser',
      'koa-json',
      'koa-compose'
    ],
    endpoints: [
      'GET /',
      'GET /api/hello',
      'POST /api/echo',
      'GET /api/config'
    ],
    timestamp: new Date().toISOString()
  };
});

router.get('/api/hello', (ctx) => {
  ctx.body = {
    success: true,
    message: 'Hello from Koa Router!',
    route: '/api/hello',
    method: ctx.method
  };
});

router.post('/api/echo', (ctx) => {
  ctx.body = {
    success: true,
    message: 'Echo endpoint',
    received: ctx.request.body,
    headers: ctx.request.headers,
    method: ctx.method
  };
});

router.get('/api/config', (ctx) => {
  ctx.body = {
    success: true,
    edgeoneConfig: {
      'external_node_modules': [
        'koa',
        '@koa/router',
        '@koa/bodyparser',
        'koa-json',
        'koa-compose'
      ],
      'configFile': 'edgeone.json'
    },
    middleware: [
      'koa-json (JSON pretty print)',
      '@koa/bodyparser (Body parsing)',
      '@koa/router (Routing)',
      'koa-compose (Middleware composition)'
    ]
  };
});

// Compose middleware
const middleware = compose([
  koaJson({ pretty: true, spaces: 2 }),
  bodyParser({
    enableTypes: ['json', 'form', 'text'],
    jsonLimit: '10mb'
  }),
  router.routes(),
  router.allowedMethods()
]);

app.use(middleware);

// Error handling
app.on('error', (err, ctx) => {
  console.error('Koa server error:', err);
});

export function onRequest(context) {
  const { request } = context;
  
  try {
    // Convert Web API Request to Node.js-style request for Koa
    return app.callback()(request);
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Koa server failed. Check external_node_modules configuration'
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
