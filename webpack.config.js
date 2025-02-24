const path = require("path");

module.exports = {
  entry: "./src/jwplayer.jsx",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "jwplayer-react.js",
    library: "JWPlayerReact",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React",
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM",
    },
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
