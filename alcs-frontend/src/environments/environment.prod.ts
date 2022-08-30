declare global {
  interface Window { env: any; }
}

export const environment = {
  production: true,
  apiUrl: window.env["apiUrl"] || 'http://localhost:8080',
  homeUrl: window.env["homeUrl"] || '/home'
};
