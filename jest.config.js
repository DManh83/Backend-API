/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverageFrom: ['src/modules/**/*.{js,ts}'],
  coveragePathIgnorePatterns: ['node_modules/'],
  reporters: ['default'],
};
