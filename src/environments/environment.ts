export const environment = {
  production: false,
  baseUrl: 'http://localhost:8080',
  apiPrefix: '/api/v1',
  get baseApiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  },
  // Google Analytics 4 Measurement ID
  // Get it from: https://analytics.google.com/analytics/web/
  // Format: G-XXXXXXXXXX
  googleAnalyticsId: '' // Add your GA4 Measurement ID here
};


