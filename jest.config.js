const { defaults } = require('jest-config');
const path = require('path');

const tsConfig = path.resolve(process.cwd(), 'tsconfig.test.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['vue', ...defaults.moduleFileExtensions],
  setupFiles: ['./tests/setup.js'],
  transform: {
    '^.+\\.js?$': ['babel-jest', { rootMode: 'upward' }],
    '^.+\\.(js|ts)x$': ['babel-jest', { rootMode: 'upward' }],
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
