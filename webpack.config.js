const path = require('path');

const webConfig = {
  target: "web",
  entry: './src/web/index.ts',
  optimization: {
		minimize: false
	},
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
          },
        },
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    host: '0.0.0.0',
    publicPath: '/dist/',
    contentBase: path.resolve(__dirname, "src"),
    watchContentBase: true,
    port: 8080
  },
  devtool: 'inline-source-map',
};

const nodeConfig = {
  target: "node",
  entry: './src/node/index.ts',
  optimization: {
		minimize: false
	},
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [
          path.resolve(__dirname, 'src/node'),
          path.resolve(__dirname, 'src/platform/node')
        ],
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.node.json'
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: 'bundle.node.js',
    path: path.resolve(__dirname, 'dist')
  }
};

module.exports = [webConfig, nodeConfig]