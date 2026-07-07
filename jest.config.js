/** @type {import('jest').Config} */
export default {
  rootDir: './',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/cssTransform.cjs', // mock CSS en CommonJS
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/cssTransform.cjs',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/fileMock.cjs',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(spec|test).[jt]s?(x)',
    '<rootDir>/src/**/*.(spec|test).[jt]s?(x)',
  ],
};
