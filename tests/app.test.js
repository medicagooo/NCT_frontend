const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..');

function clearProjectModules() {
  Object.keys(require.cache).forEach((modulePath) => {
    if (modulePath.startsWith(projectRoot)) {
      delete require.cache[modulePath];
    }
  });
}

function loadApp(envOverrides = {}) {
  const originalValues = Object.fromEntries(
    Object.keys(envOverrides).map((key) => [key, process.env[key]])
  );

  Object.entries(envOverrides).forEach(([key, value]) => {
    process.env[key] = value;
  });

  clearProjectModules();
  const app = require(path.join(projectRoot, 'app/server'));

  Object.entries(originalValues).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  });

  return app;
}

function requestPath(app, requestPath) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const request = http.get({
        hostname: '127.0.0.1',
        port,
        path: requestPath
      }, (response) => {
        let body = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          server.close(() => {
            resolve({
              body,
              headers: response.headers,
              statusCode: response.statusCode
            });
          });
        });
      });

      request.on('error', (error) => {
        server.close(() => reject(error));
      });
    });
  });
}

test('root page renders successfully', async () => {
  const app = loadApp({ DEBUG_MOD: 'false' });
  const response = await requestPath(app, '/');

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /NO CONVERSION THERAPY/i);
});

test('sitemap.xml lists static pages and blog articles', async () => {
  const app = loadApp({
    DEBUG_MOD: 'false',
    SITE_URL: 'https://example.com'
  });
  const response = await requestPath(app, '/sitemap.xml');

  assert.equal(response.statusCode, 200);
  assert.match(response.headers['content-type'], /application\/xml/);
  assert.match(response.body, /<loc>https:\/\/example\.com\/<\/loc>/);
  assert.match(response.body, /<loc>https:\/\/example\.com\/form<\/loc>/);
  assert.match(response.body, /<loc>https:\/\/example\.com\/map<\/loc>/);
  assert.match(response.body, /<loc>https:\/\/example\.com\/blog<\/loc>/);
  assert.match(response.body, /https:\/\/example\.com\/port\/%E9%97%9C%E6%96%BC%E5%BF%83%E7%A8%AE%E5%AD%90%E6%95%99%E8%82%B2%E9%81%95%E6%B3%95%E8%BE%A6%E5%AD%B8%E7%9A%84%E6%8E%A7%E5%91%8A/);
  assert.doesNotMatch(response.body, /\/debug<\/loc>/);
});

test('robots.txt exposes sitemap and blocks non-indexable routes', async () => {
  const app = loadApp({
    DEBUG_MOD: 'false',
    SITE_URL: 'https://example.com'
  });
  const response = await requestPath(app, '/robots.txt');

  assert.equal(response.statusCode, 200);
  assert.match(response.headers['content-type'], /text\/plain/);
  assert.match(response.body, /^User-agent: \*$/m);
  assert.match(response.body, /^Allow: \/$/m);
  assert.match(response.body, /^Disallow: \/api\/$/m);
  assert.match(response.body, /^Disallow: \/submit$/m);
  assert.match(response.body, /^Disallow: \/debug$/m);
  assert.match(response.body, /^Sitemap: https:\/\/example\.com\/sitemap\.xml$/m);
});

test('debug page is hidden when debug mode is disabled', async () => {
  const app = loadApp({ DEBUG_MOD: 'false' });
  const response = await requestPath(app, '/debug');

  assert.equal(response.statusCode, 404);
});

test('debug page renders when debug mode is enabled', async () => {
  const app = loadApp({ DEBUG_MOD: 'true' });
  const response = await requestPath(app, '/debug');

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Debug/);
});

test('blog route blocks directory traversal attempts', async () => {
  const app = loadApp({ DEBUG_MOD: 'false' });
  const response = await requestPath(app, '/port/..%2FREADME');

  assert.equal(response.statusCode, 404);
  assert.doesNotMatch(response.body, /NO CONVERSION THERAPY/i);
});

test('markdown rendering escapes raw HTML and strips dangerous links', () => {
  clearProjectModules();
  const { renderMarkdown } = require(path.join(projectRoot, 'app/services/markedService'));
  const html = renderMarkdown('<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n\n[good](https://example.com?a=1&b=2)');

  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /href="javascript:/i);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('map data service preserves valid upstream sync timestamps', () => {
  clearProjectModules();
  const { resolveLastSyncedTimestamp } = require(path.join(projectRoot, 'app/services/mapDataService'));

  assert.equal(resolveLastSyncedTimestamp('1774925078387', 123), 1774925078387);
  assert.equal(resolveLastSyncedTimestamp(undefined, 123), 123);
  assert.equal(resolveLastSyncedTimestamp('-1', 123), 123);
});

test('map data service can bypass in-memory cache on force refresh', async () => {
  clearProjectModules();
  const mapDataService = require(path.join(projectRoot, 'app/services/mapDataService'));
  const originalFetch = global.fetch;
  let fetchCount = 0;

  mapDataService.resetMapDataCache();
  global.fetch = async () => {
    fetchCount += 1;

    return {
      ok: true,
      async json() {
        return {
          avg_age: 18,
          last_synced: 1000 + fetchCount,
          statistics: [],
          data: []
        };
      }
    };
  };

  try {
    await mapDataService.getMapData({ publicMapDataUrl: 'https://example.com/api/map-data' });
    await mapDataService.getMapData({ publicMapDataUrl: 'https://example.com/api/map-data' });
    await mapDataService.getMapData({ forceRefresh: true, publicMapDataUrl: 'https://example.com/api/map-data' });
  } finally {
    global.fetch = originalFetch;
    mapDataService.resetMapDataCache();
  }

  assert.equal(fetchCount, 2);
});
