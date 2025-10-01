// For local development with proxy
// Make sure to run the backend locally and the proxy is configured
// in proxy.conf.json to forward /api to http://localhost:8080
export const environment = {
  production: false,
  apiUrl: '/api', // This will be proxied to localhost:8080 in development
  useProxy: true // Flag to indicate we're using the proxy in development
};
