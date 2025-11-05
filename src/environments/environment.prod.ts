export const environment = {
  production: true,
  baseUrl: 'http://backend.kubevpro.i-consulting.shop',
  apiPrefix: '/api/v1',
  get baseApiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  }
};


