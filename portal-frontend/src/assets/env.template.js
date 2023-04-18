(function (window) {
  window['env'] = window['env'] || {};

  // Environment variables
  window['env']['apiUrl'] = '${API_URL}';
  window['env']['alcsUrl'] = '${ALCS_URL}';
})(this);
