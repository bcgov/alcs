module.exports = {
  preset: 'jest-preset-angular',
  moduleDirectories: ['node_modules', 'src'],
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
