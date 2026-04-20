export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'index.js',
    '!node_modules/**',
    '!coverage/**'
  ],
  coverageReporters: ['lcov', 'text', 'html'],
  testMatch: [
    '**/*.test.js',
    '**/*.spec.js'
  ],
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  preset: null,
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
