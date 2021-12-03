import {RuleSetRule} from 'webpack';
import * as path from 'path';
import {generateScopedName} from '../lib/css_minifier/cssname_minifier';
import * as MiniCSSExtractPlugin from 'mini-css-extract-plugin';
/**
 * List of Loaders
 */

export const getTSloader = (): RuleSetRule => {
  return {
    test: /\.tsx?$/,
    use: [
      {
        loader: 'babel-loader'
      },
      {
        loader: 'ts-loader',
        options: {
          // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
          happyPackMode: false
        }
      }
    ],
    exclude: /node_modules|vendor/,
  };
};
export const getUrlLoader = (isProductionMode = false): RuleSetRule => {
  return {
    loader: 'url-loader',
    test: /\.(jpe?g|png|gif|mp3|wav)(\?.*$|$)/,
    options: {
      name: isProductionMode ? 'assets/images/[name][hash:6]' : 'assets/images/[name]'
    }
  };
};

export const getSassLoader = (isProductionMode = false): RuleSetRule => {
  const getlocalIdent = isProductionMode ? (context: any, localIdentName: string, localName: string) =>
    generateScopedName(localName, context.resourcePath) : undefined;

  return {
    test: /\.s?css$/,
    use: [
      MiniCSSExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          localIdentName: '[path][name]__[local]--[hash:base64:5]',
          getLocalIdent: getlocalIdent,
          camelCase: true,
          minimize: true,
          sourceMap: true
        }
      }, {
        loader: 'resolve-url-loader',
        options: {}
      }, {
        loader: 'postcss-loader',
        options: {
          sourceMap: true
        }
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          includePaths: [
            '../src/components/_sass'
          ]
            .map((d) => path.join(__dirname, d))
        }
      }
    ]
  };
};
export const getImageFileLoader = (isProductionMode = false): RuleSetRule => {
  return {
    loader: 'file-loader',
    test: /\.(jpe?g|png|gif|mp3|wav)(\?.*$|$)/,
    options: {
      name: isProductionMode ? 'assets/images/[name]_[hash:6].[ext]' : 'assets/images/[name].[ext]'
    }
  };
}
export const getFileLoader = (): RuleSetRule => {
  return {
    loader: 'file-loader',
    test: /\.(ico|ttf|eot|woff2?)$/,
    options: {
      name: 'assets/fonts/[name].[ext]',
      publicPath: '../../'
    }
  };
};

export const getSvgLoader = (): RuleSetRule => {
  return {
    test: /\.svg$/,
    include: [],
    use: [{
      loader: 'svg-sprite-loader',
      options: {
        extract: false,
        esModule: false, // no default export
        runtimeGenerator: require.resolve('../lib/svgRuntimeGenerator/svgRuntimeGenerator.js')
      }
    }]
  };
};
