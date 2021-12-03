import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import * as path from "path";
import {
  getCopyWebpackPlugin,
  getDefinePlugin,
  getHTMLPlugin, getLoaderOptionsPlugin, getManifestPlugin,
  getMiniCSSExtractPlugin,
  getOptimizeCssAssetsPlugin,
  getStatsWriterPlugin, getSWPrecachePlugin, getUglifyJSplugin,
} from "./plugins";
import {
  getTSloader,
  getSassLoader, getSvgLoader, getImageFileLoader
} from "./loaders";
import {Plugin} from "webpack";
import * as CleanWebpackPlugin from "clean-webpack-plugin";

const isProductionMode = process.env.NODE_ENV === "production";
const isSWEnabled = process.env.ENABLE_SW;

const devServer: webpackDevServer.Configuration = {
  contentBase: path.resolve(__dirname, "..", "dist"),
  host: "0.0.0.0",
  port: 8100,
  public: "0.0.0.0:8100",
  hot: true,
  inline: true,
  disableHostCheck: true,
  historyApiFallback: true
};

const plugins: Plugin[] = [
  getLoaderOptionsPlugin(isProductionMode),
  getCopyWebpackPlugin(),
  getMiniCSSExtractPlugin({filename: isProductionMode ? "assets/css/[name].[hash:6].bundle.css" : "assets/css/[name].bundle.css"}),
  getHTMLPlugin({
    favicon: path.resolve(__dirname, "..", "src/template/favicon.ico"),
    template: path.resolve(__dirname, "..", "src/template/index.html"),
    title: "Live Captioning"
  }),
  getDefinePlugin(isProductionMode),
  new webpack.HotModuleReplacementPlugin(),
  getOptimizeCssAssetsPlugin(),
  getDefinePlugin(),
  getStatsWriterPlugin(isProductionMode)
];

if (isProductionMode) {
  plugins.push(new CleanWebpackPlugin([path.resolve(__dirname, "..", "dist")], {root: process.cwd()}));
  plugins.push(getManifestPlugin());
}

if (isSWEnabled || isProductionMode) {
  plugins.push(getSWPrecachePlugin());
}

const config: webpack.Configuration = {
  mode: isProductionMode ? "production" : "development",
  entry: {
    app: [path.resolve(__dirname, "..", "src/app/app.tsx")]
  },
  module: {
    rules: [
      getTSloader(),
      getSassLoader(isProductionMode),
      // getUrlLoader(isProductionMode),
      getImageFileLoader(isProductionMode),
      getSvgLoader()
    ]
  },
  optimization: {
    minimize: isProductionMode,
    minimizer: [
      getUglifyJSplugin()
    ],
    runtimeChunk: "multiple",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins,
  devtool: isProductionMode ? false : "source-map",
  output: {
    filename: isProductionMode ? "assets/js/[name].[hash:6].bundle.js" : "assets/js/[name].bundle.js",
    path: path.resolve(__dirname, "..", "dist"),
    publicPath: "/"
  },
  node: {
    dgram: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
  }
};

export default {...config, devServer};
