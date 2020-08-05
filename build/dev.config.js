const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./dev/index.js",
  stats: "errors-only",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "../example")
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "eslint-loader",
        enforce: "pre",
        include: [path.resolve(__dirname, "src")],
        options: {
          formatter: require("eslint-friendly-formatter")
        }
      },
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
      }
    ]
  },
  devServer: {
    clientLogLevel: "silent",
    contentBase: path.join(__dirname, "static"),
    hot: true,
    compress: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "dev/index.html",
      inject: true
    })
  ],
  resolve: {
    extensions: [".ts", ".js"]
  }
};
