import path from "path";

const filename = "service.cjs";
const __dirname = path.resolve();

const config = {
  target: "node",
  mode: "production",
  resolve: {
    extensions: ["*", ".mjs", ".cjs", ".ts", ".js"],
  },
  entry: path.resolve(__dirname, "index.js"),
  output: {
    filename,
    // library: {
    //   type: "this",
    // },
    // clean: true,
    // libraryTarget: "commonjs2",
  },
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
