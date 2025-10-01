// Production environment - uses the actual API endpoint directly
// Using HTTP for demo purposes
// In production, always use HTTPS for security
export const environment = {
  production: true,
  apiUrl: 'http://production-alb-1780857463.eu-north-1.elb.amazonaws.com/api',
  useProxy: false // No proxy in production
};
