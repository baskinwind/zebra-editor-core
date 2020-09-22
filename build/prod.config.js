const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  stats: "errors-only",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "../dist"),
    library: "ZebraEditorCore",
    libraryTarget: "umd",
  },
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "eslint-loader",
        enforce: "pre",
        include: [path.resolve(__dirname, "src")],
        options: {
          formatter: require("eslint-friendly-formatter"),
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
