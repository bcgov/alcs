# End-to-End Testing

- [Running Tests](#running-tests)
- [Local Setup](#local-setup)
  - [Installation](#installation)
  - [Configure Secrets](#configure-secrets)
- [Known Issues](#known-issues)

E2E test automation is implemented using the [Playwright](https://playwright.dev/).

> [!NOTE]
> All instructions contained in this document assume `<alcs_repo_dir>/e2e` is the current working directory.

> [!WARNING]
> When writing tests, make sure they do not contain any secrets _before_ committing to the repo. All secrets should be defined in the ignored `.env` file (see [Configure Secrets](#configure-secrets)).

## Running Tests

To run tests:

```bash
$ npx playwright test
```

This will just run the tests in the background and show results in the console. This is the main way to run tests.

To run tests just for a specific browser:

```bash
$ npx playwright test --project=[chromium]
```

To run in debug mode:

```bash
$ npx playwright test --debug
```

This opens the tests in a browser and lets you visually step through the actions and see what each command is doing. It also has a locator tool that lets you test out locators.

To run in UI mode:

```bash
$ npx playwright test --ui
```

This is a cool way to explore tests and see the results in realtime.

To show a report:

```bash
$ npx playwright show-report [REPORT_DIR]
```

If `REPORT_DIR` is blank, it'll show the report of the most recently run test.

## Local Setup

### Installation

Install package:

```bash
$ npm i
```

Install browsers:

```bash
$ npx playwright install
```

### Configure Secrets

1. Copy `template.env` --> `.env`
2. Fill in details

## Known Issues

- When signed in, navigation via URL always redirects to login page
- Parcel entry step UI is not fully functional; stick to single parcel for now
