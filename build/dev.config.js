const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  target: "web",
  mode: "development",
  entry: "./dev/index.js",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.styl(us)?$/,
        use: ["style-loader", "css-loader", "stylus-loader"],
      },
    ],
  },
  devServer: {
    port: 9000,
    open: true,
    hot: true,
    clientLogLevel: "warn",
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "dev/index.html",
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
};
