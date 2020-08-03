module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: require.resolve('./tsconfig.eslint.json'),
  },
  env: {
    es6: true,
    node: true,
  },
}
