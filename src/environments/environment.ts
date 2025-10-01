// For local development with proxy
// Make sure to run the backend locally and the proxy is configured
// in proxy.conf.json to forward /api to http://localhost:8080
export const environment = {
  production: false,
  // In development, use the proxy to avoid CORS issues
  apiUrl: '/api',
  // Enable proxy in development
  useProxy: true,
  // Development-specific settings
  debug: true,
  // CORS settings for development
  cors: {
    allowedOrigins: ['http://localhost:4200'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    allowCredentials: true,  // Enable if you need to send credentials
    maxAge: 3600            // Cache preflight request for 1 hour
  }
};
