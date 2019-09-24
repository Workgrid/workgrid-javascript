const path = require('path')
const merge = require('webpack-merge')
const config = require('@workgrid/typescript/webpack.config')

module.exports = merge(config, {
  entry: path.resolve(__dirname, './src/micro-app.ts'),
  output: { filename: 'micro-app.js', library: 'WorkgridMicroApp', libraryExport: 'default' },
  target: 'web'
})
