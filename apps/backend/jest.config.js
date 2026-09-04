module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!**/*.entity.ts', '!**/main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@censo-motos/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/jest.setup.ts'],
  testTimeout: 30000,
};