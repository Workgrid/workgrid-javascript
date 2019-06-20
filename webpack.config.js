const path = require('path');

function srcPath(subdir) {
    return path.join(__dirname, "src", subdir);
}

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {                        
        utils: srcPath('packages/utils'),            
        logger: srcPath('packages/utils/logger'),    
        client: srcPath('packages/client/src/client')    
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
