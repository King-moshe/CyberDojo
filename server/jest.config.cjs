module.exports = {
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/src/tests/**/*.test.ts', '!**/src/tests/integration/**'],
      roots: ['<rootDir>/src'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      moduleDirectories: ['node_modules', '<rootDir>/src'],
      setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
      verbose: true,
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
    },
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/src/tests/integration/**/*.test.ts'],
      roots: ['<rootDir>/src'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      moduleDirectories: ['node_modules', '<rootDir>/src'],
      setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
      verbose: true,
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
    },
  ],
};
