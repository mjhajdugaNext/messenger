const commonConfig = require('./jest.config');

module.exports = {
  ...commonConfig,
  testMatch: ['**/*.functional.test.{js,ts}'],
  coverageDirectory: 'coverage/functional'
};