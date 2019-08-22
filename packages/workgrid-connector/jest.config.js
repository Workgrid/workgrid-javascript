/* eslint-env node */
const { resolve, basename } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '..', '..'),
  roots: [__dirname],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: require.resolve('./tsconfig.json')
    }
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        output: `<rootDir>/test-reports/${basename(__dirname)}.xml`
      }
    ]
  ]
}
