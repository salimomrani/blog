export const environment = {
  production: true,
  baseUrl: '',  // Use relative URL - Nginx will proxy to backend
  apiPrefix: '/api/v1',
  get baseApiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  }
};


