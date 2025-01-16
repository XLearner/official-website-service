import path from "path";
import nodeExternals from "webpack-node-externals";

const filename = "service.cjs";
const __dirname = path.resolve();

const config = {
  target: "node",
  mode: "production",
  resolve: {
    modules: [path.join(__dirname, "index.js"), "node_modules"],
    extensions: ["*", ".mjs", ".cjs", ".ts", ".js"],
  },
  entry: path.resolve(__dirname, "index.js"),
  output: {
    filename,
    // library: {
    //   type: "this",
    // },
    // clean: true,
    // libraryTarget: "commonjs",
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: [
      //     {
      //       loader: "babel-loader",
      //       // options: {
      //       //   presets: [
      //       //     [
      //       //       "@babel/env",
      //       //       {
      //       //         useBuiltIns: "entry",
      //       //         corejs: 3.29,
      //       //       },
      //       //     ],
      //       //     "@babel/typescript",
      //       //   ],
      //       // },
      //     },
      //   ],
      // },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
        use: {
          loader: "babel-loader",
        },
        // resolve: {
        //   fullySpecified: false,
        // },
      },
    ],
  },
  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     // new TerserPlugin({
  //     //   terserOptions: {
  //     //     compress: {},
  //     //   },
  //     //   extractComments: false,
  //     // }),
  //   ],
  // },
};

export default config;
