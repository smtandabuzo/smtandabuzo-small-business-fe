// Production environment configuration for AWS
const ALB_DOMAIN = 'production-alb-1780857463.eu-north-1.elb.amazonaws.com';

export const environment = {
  production: true,
  // Use HTTP for now, but plan to move to HTTPS
  apiUrl: `http://${ALB_DOMAIN}/api`,
  useProxy: false, // No proxy needed in production
  debug: false, // Disable debug logging in production
  
  // CORS settings
  cors: {
    // Restrict to your domain in production
    allowedOrigins: ['*'], // Replace with your domain: ['https://yourdomain.com']
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'X-XSRF-TOKEN',
      'X-Forwarded-For'
    ],
    allowCredentials: true,
    maxAge: 86400 // 24 hours
  },
  
  // API endpoints
  apiEndpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      refresh: '/auth/refresh-token',
      logout: '/auth/logout'
    },
    // Add other API endpoints as needed
  },
  
  // AWS-specific settings
  aws: {
    region: 'eu-north-1',
    userPoolId: 'YOUR_COGNITO_USER_POOL_ID', // If using Cognito
    userPoolWebClientId: 'YOUR_COGNITO_CLIENT_ID', // If using Cognito
    oauth: {
      domain: 'YOUR_COGNITO_DOMAIN',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://YOUR_DOMAIN/callback',
      redirectSignOut: 'http://YOUR_DOMAIN/signout',
      responseType: 'code'
    }
  }
};
