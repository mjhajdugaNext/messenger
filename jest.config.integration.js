const commonConfig = require('./jest.config');

module.exports = {
  ...commonConfig,
  testMatch: ['**/*.integration.test.{js,ts}'],
  coverageDirectory: 'coverage/integration'
};