(function (window) {
  window['env'] = window['env'] || {};

  // Environment variables
  window['env']['apiUrl'] = '${API_URL}';
  window['env']['portalUrl'] = '${PORTAL_URL}';
  window['env']['homeUrl'] = '/home';
})(this);
