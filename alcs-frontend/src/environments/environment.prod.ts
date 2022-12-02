declare global {
  interface Window {
    env: any;
  }
}

export const environment = {
  production: true,
  siteName: 'ALCS',
  apiUrl: window.env?.['apiUrl'] || 'http://localhost:8080',
  homeUrl: window.env?.['homeUrl'] || '/home',
  dateFormat: 'YYYY-MMM-DD',
  shortTimeFormat: 'MMM D, h:mm a',
  longTimeFormat: 'YYYY-MMM-DD hh:mm:ss a',
  maxFileSize: 104857600, //should match setting in backend
};
