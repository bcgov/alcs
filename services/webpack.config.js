// webpack.config.js
module.exports = function (options) {
  return {
    ...options,
    devtool: 'inline-source-map',
  };
};
