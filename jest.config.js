module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  reporters: ['default', ['jest-junit', { output: './test-reports/junit.xml' }]]
}
