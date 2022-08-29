declare global {
  interface Window { env: any; }
}

export const environment = {
  production: true,
  apiRoot:  window.env["apiUrl"] || 'http://localhost:8080',
  homeUrl: window.env["apiUrl"] || '/home'
};
