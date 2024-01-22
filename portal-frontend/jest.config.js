module.exports = {
  preset: 'jest-preset-angular',
  moduleDirectories: ['node_modules', 'src'],
  modulePathIgnorePatterns: ['/test'],
  coverageReporters: [
    [
      'lcov',
      {
        projectRoot: '../',
      },
    ],
  ],
};
