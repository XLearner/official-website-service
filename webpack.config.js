import path from "path";
import nodeExternals from "webpack-node-externals";

const filename = "service.cjs";
const __dirname = path.resolve();

const config = {
  target: "node",
  mode: "production",
  entry: path.resolve(__dirname, "index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename,
    libraryTarget: "commonjs2",
  },
  externals: [
    // 所有 node_modules 保持 external，不打包进 bundle
    nodeExternals(),
    // sharp 是 native 模块，必须 external
    "sharp",
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // 强制 webpack 4 不支持的语法被转换（如可选链 ?.）
            // Node 22 原生支持但这些语法 webpack 4 acorn 无法解析
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { node: "14" },
                  modules: false,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  // 避免打包 Node 内置模块
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default config;
