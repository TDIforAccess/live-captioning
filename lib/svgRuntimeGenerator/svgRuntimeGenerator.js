const pascalCase = require('pascal-case');
const {stringifySymbol} = require('svg-sprite-loader/lib/utils');
const {stringifyRequest} = require('loader-utils');

module.exports = function({symbol, config, context}) {
  const displayName = `SVG${pascalCase(symbol.id)}`;
  if (config) {
    const {spriteModule, symbolModule} = config;

    const spriteRequest = stringifyRequest({ context }, spriteModule);
    const symbolRequest = stringifyRequest({ context }, symbolModule);

    return [
      'var React = require("react");',
      `var SpriteSymbol = require(${symbolRequest});`,
      `var sprite = require(${spriteRequest});`,
      `var symbol = new SpriteSymbol(${stringifySymbol(symbol)});`,
      `sprite.add(symbol);`,
      `module.exports.default = function ${displayName}(props) {
    return React.createElement(
      'svg',
      props,
      React.createElement(
        'use',
        {
          xlinkHref: '#${symbol.id}'
        }
      )
    );
  };`
    ].join('\n');
  } else {
    return [
      'var React = require("react");',
      `module.exports.default = function ${displayName}(props) {
    return React.createElement(
      'svg',
      props,
      React.createElement(
        'use',
        {
          xlinkHref: '#${symbol.id}'
        }
      )
    );
  };`
    ].join('\n');
  }
}
