// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The path to a module that runs some code to configure or set up the testing framework before each test.
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!node-fetch)/',
  ],
  // Add this to handle ES Modules
  transform: {
    '^.+\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
