const path = require('path')
const merge = require('webpack-merge')
const config = require('@workgrid/typescript/webpack.config')

module.exports = merge(config, {
  entry: path.resolve(__dirname, './src/courier.ts'),
  output: { filename: 'courier.js' },
  target: 'web'
})
