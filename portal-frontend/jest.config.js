module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleDirectories: ['node_modules', 'src'],
  modulePathIgnorePatterns: ['/test'],
  coverageReporters: ['lcov'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  moduleNameMapper: {
    '\\.(jpg|png|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
