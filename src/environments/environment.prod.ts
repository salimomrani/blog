export const environment = {
  production: true,
  baseUrl: 'https://blog.kubevpro.i-consulting.shop',
  apiPrefix: '/api/v1',
  get baseApiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  }
};


