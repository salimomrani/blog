export const environment = {
  production: false,
  baseUrl: 'http://localhost:8080',
  apiPrefix: '/api/v1',
  get baseApiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  }
};


