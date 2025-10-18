import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: [
    '<rootDir>/src/__tests__/clones/**/*.test.(ts|tsx)',
    '<rootDir>/src/__tests__/games/**/*.test.(ts|tsx)',
  ],
};

export default createJestConfig(customJestConfig);
