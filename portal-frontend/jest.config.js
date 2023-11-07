module.exports = {
  preset: 'jest-preset-angular',
  moduleDirectories: ['node_modules', 'src'],
  reporters: [['github-actions', { silent: false }], 'summary'],
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
