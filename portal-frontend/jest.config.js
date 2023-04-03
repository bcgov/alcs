module.exports = {
  preset: 'jest-preset-angular',
  moduleDirectories: ['node_modules', 'src'],
  modulePathIgnorePatterns:['/test'],
  globalSetup: 'jest-preset-angular/global-setup',
  coverageReporters: [
    [
      'lcov',
      {
        projectRoot: '../',
      },
    ],
  ],
};
