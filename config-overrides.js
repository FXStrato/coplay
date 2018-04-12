const {injectBabelPlugin} = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
  // do stuff with the webpack config...
  config = injectBabelPlugin([
    'import', {
      libraryName: 'antd',
      style: true
    }
  ], config); // change importing css to less
  config = rewireLess.withLoaderOptions({
    modifyVars: {
      "@primary-color": "#19b8c6",
      "@layout-header-background": "#fff",
      "@layout-body-background": "#fff"
    }
  })(config, env);
  return config;
};
