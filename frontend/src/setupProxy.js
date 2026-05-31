// Proxies API/auth/upload calls to the Spring Boot backend so the app is single-origin.
// This makes one ngrok tunnel (on :3000) serve both the UI and the API, and avoids CORS.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = 'http://localhost:8092';
  const proxy = createProxyMiddleware({ target, changeOrigin: true, ws: true });
  app.use('/api', proxy);
  app.use('/uploads', proxy);
  app.use('/oauth2', proxy);
  app.use('/login/oauth2', proxy);
  app.use('/actuator', proxy);
};
