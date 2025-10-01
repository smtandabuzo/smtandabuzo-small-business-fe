// Production environment - uses the actual API endpoint directly
export const environment = {
  production: true,
  apiUrl: 'https://production-alb-1780857463.eu-north-1.elb.amazonaws.com/api',
  useProxy: false // No proxy in production
};
