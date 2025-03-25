// filepath: e:\GSI\dota2-gsi-draft-overlay\overlay-ui\src\setupProxy.js
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
    })
  );
};