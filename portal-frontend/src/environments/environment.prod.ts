declare global {
  interface Window {
    env: any;
  }
}

export const environment = {
  production: true,
  apiUrl: window.env?.['apiUrl'] || 'http://localhost:8081',
  dateFormat: 'YYYY-MMM-DD',
  shortTimeFormat: 'MMM D, h:mm a',
  longTimeFormat: 'YYYY-MMM-DD hh:mm:ss a'
};
