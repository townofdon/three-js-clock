const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: "development",
  entry: {
    app: "./src/index.js",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        include: path.resolve(__dirname, "src"),
        use: ["file-loader"],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      title: "Three.js Clock",
    }),
  ],
  output: {
    filename: "[name]_bundle.js",
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
  },
};