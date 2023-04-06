const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const meta = {
  title: "Demo - Simple Three.js Clock",
  desc: "This is just a demo showcasing a simple 3D clock made using Three.js.",
  image: "https://townofdon.github.io/three-js-clock/demo.gif",
  url: "https://townofdon.github.io/three-js-clock/",
};

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
      meta: {
        description: { name: "description", content: meta.desc },
        "og:title": {
          property: "og:title",
          content: meta.title,
        },
        "og:description": { property: "og:description", content: meta.desc },
        "og:type": { property: "og:type", content: "website" },
        "og:url": { property: "og:url", content: meta.url },
        "og:image": { property: "og:image", content: meta.image },
        "twitter:card": {
          name: "twitter:card",
          content: "summary_large_image",
        },
        "twitter:title": { name: "twitter:title", content: meta.title },
        "twitter:description": {
          name: "twitter:description",
          content: meta.desc,
        },
        "twitter:image": { name: "twitter:image", content: meta.image },
      },
    }),
  ],
  output: {
    filename: "[name]_bundle.js",
    path: path.resolve(__dirname, "build"),
    publicPath: "/three-js-clock/",
  },
};