const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://dev-project-ecommerce.upgrad.dev",
      changeOrigin: true,
      onProxyRes: (proxyRes, req, res) => {
        if (proxyRes.headers["x-auth-token"]) {
          res.setHeader("x-auth-token", proxyRes.headers["x-auth-token"]);
        }
      },
    })
  );
};