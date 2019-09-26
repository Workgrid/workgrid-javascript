module.exports = {
  projects: ['<rootDir>/packages/*'],
  reporters: ['default', ['jest-junit', { outputDirectory: `<rootDir>/test-reports/` }]]
}
