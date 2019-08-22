module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: require.resolve('./tsconfig.json')
  },
  env: {
    es6: true,
    browser: true,
    commonjs: true
  }
}
