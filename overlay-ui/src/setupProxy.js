const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/league/heroes',
    createProxyMiddleware({
      target: 'https://test.api.imprint.gg',
      changeOrigin: true,
      pathRewrite: {
        '^/league/heroes': '/league/heroes',
      },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('Content-Type', 'application/json');
      },
    })
  );
};