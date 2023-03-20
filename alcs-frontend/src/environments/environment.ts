// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

declare global {
  interface Window {
    env: any;
  }
}

export const environment = {
  production: false,
  siteName: 'ALCS',
  apiUrl: (window.env?.['apiUrl'] || 'http://localhost:8080') + '/alcs',
  authUrl: window.env?.['apiUrl'] || 'http://localhost:8080',
  homeUrl: window.env?.['homeUrl'] || '/home',
  dateFormat: 'YYYY-MMM-DD',
  shortTimeFormat: 'MMM D, h:mm a',
  longTimeFormat: 'YYYY-MMM-DD hh:mm:ss a',
  maxFileSize: 104857600, //should match setting in backend
  embeddedDashboards: {
    gis: 'https://alcs-metabase-test.apps.silver.devops.gov.bc.ca/public/dashboard/60dbe902-caea-4824-b7e5-ab2d7e5bdcbe',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
