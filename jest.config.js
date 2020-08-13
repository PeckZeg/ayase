const { defaults } = require('jest-config');
const path = require('path');

const tsConfig = path.resolve(process.cwd(), 'tsconfig.test.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['vue', ...defaults.moduleFileExtensions],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest'
  },
  globals: {
    'ts-jest': {
      tsConfig
    },

    'vue-jest': {
      tsConfig
    }
  }
};
