module.exports = {
  projects: ['<rootDir>/packages/*'],
  reporters: ['default', ['jest-junit', { output: `<rootDir>/test-reports/junit.xml` }]]
}
