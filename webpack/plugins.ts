import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import {LoaderOptionsPlugin, Plugin, DefinePlugin} from 'webpack';
import * as MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import * as UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';
import * as SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**
 * List of Plugins
 */

export const getHTMLPlugin = (options?: HtmlWebpackPlugin.Options): Plugin => {
  return new HtmlWebpackPlugin({
    ...options,
    cache: false,
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    }
  });
};


export const getForkTsCheckerWebpackPlugin = (config: any): Plugin => {
  return new ForkTsCheckerWebpackPlugin(
    {
      ...config,
      checkSyntacticErrors: true,
      silent: true
    }
  );
};

export const getLoaderOptionsPlugin = (isProductionMode = false): Plugin => {
  return new LoaderOptionsPlugin({
    minimize: true,
    debug: !isProductionMode,
    options: {
      context: __dirname
    }
  });
};

export const getCopyWebpackPlugin = (): Plugin => {
  // Helps to copy the xmls from the specific path to required path
  // flatten: true, just copy the files and ignore the folder path
  // force: true, overwrite the files even though they exist
  return new CopyWebpackPlugin([
    {
      from: './test/*.css',
      to: './assets/css/',
      force: true,
      flatten: true
    },
    {
      from: './src/static/*.js',
      to: './assets/js/',
      force: true,
      flatten: true
    },
    {
      from: './src/static/*.css',
      to: './assets/css/',
      force: true,
      flatten: true
    },
    {
      from: './test/demo/*.xml',
      to: './assets/xml/',
      force: true,
      flatten: true
    },
    {
      from: './src/apps/seriesplayer/assets/*.*',
      to: './assets/audio/',
      force: true,
      flatten: true
    }
  ]);
};

export const getOptimizeCssAssetsPlugin = (): Plugin => {
  return new OptimizeCSSAssetsPlugin({
    assetNameRegExp: /\.s?css$/,
    cssProcessorOptions: {
      discardDuplicates: {
        removeAll: true
      },
      discardComments: {
        removeAll: true
      }
    },
    canPrint: false
  });
};

export const getDefinePlugin = (isProductionMode = false): Plugin => {
  return new DefinePlugin({
    process: {
      env: {
        NODE_ENV: JSON.stringify(isProductionMode ? 'production' : 'development'),
        ENABLE_SW: process.env.ENABLE_SW
      }
    }
  });
};


export const getStatsWriterPlugin = (isProductionMode = false) => {
  const {StatsWriterPlugin} = require('webpack-stats-plugin');
  return new StatsWriterPlugin({
    filename: `app-${isProductionMode ? 'production' : 'development'}.json`
  });
};

export const getMiniCSSExtractPlugin = (options: MiniCSSExtractPlugin.PluginOptions) => {
  return new MiniCSSExtractPlugin(options);
};

export const getUglifyJSplugin = () => {
  return new UglifyJsPlugin({
    uglifyOptions: {
      parse: {
        // we want uglify-js to parse ecma 8 code. However we want it to output
        // ecma 5 compliant code, to avoid issues with older browsers, this is
        // whey we put `ecma: 5` to the compress and output section
        // https://github.com/facebook/create-react-app/pull/4234
        ecma: 8,
      },
      compress: {
        ecma: 5,
        warnings: false,
        // Disabled because of an issue with Uglify breaking seemingly valid code:
        // https://github.com/facebook/create-react-app/issues/2376
        // Pending further investigation:
        // https://github.com/mishoo/UglifyJS2/issues/2011
        comparisons: false,
      },
      mangle: {
        safari10: true,
      },
      output: {
        ecma: 5,
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebook/create-react-app/issues/2488
        ascii_only: true,
      },
    },
    // Use multi-process parallel running to improve the build speed
    // Default number of concurrent runs: os.cpus().length - 1
    parallel: true,
    // Enable file caching
    cache: true,
    sourceMap: true,
  })
};

export const getManifestPlugin = () => {
  return new ManifestPlugin({fileName: 'asset-manifest.json'});
};

export const getSWPrecachePlugin = () => {
  console.log('Bundling the plugin');
  return new SWPrecacheWebpackPlugin({
    // By default, a cache-busting query parameter is appended to requests
    // used to populate the caches, to ensure the responses are fresh.
    // If a URL is already hashed by Webpack, then there is no concern
    // about it being stale, and the cache-busting can be skipped.
    dontCacheBustUrlsMatching: /\.\w{8}\./,
    filename: 'service-worker.js',
    logger(message: string) {
      if (message.indexOf('Total precache size is') === 0) {
        // This message occurs for every build and is a bit too noisy.
        return;
      }
      if (message.indexOf('Skipping static resource') === 0) {
        // This message obscures real errors so we ignore it.
        // https://github.com/facebookincubator/create-react-app/issues/2612
        return;
      }
      console.log(message);
    },
    minify: true,
    // For unknown URLs, fallback to the index page
    // navigateFallback: publicUrl + '/index.html',
    // Ignores URLs starting from /__ (useful for Firebase):
    // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
    navigateFallbackWhitelist: [/^(?!\/__).*/],
    // Don't precache sourcemaps (they're large) and build asset manifest:
    staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/]
  });
};
