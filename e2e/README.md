# End-to-End Testing

- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Local Setup](#local-setup)
  - [Installation](#installation)
  - [Configure secrets](#configure-secrets)

E2E test automation is implemented using the [Playwright](https://playwright.dev/).

> [!WARNING]
> When writing tests, make sure they do not contain any credentials _before_ committing to the repo.

## Writing Tests

- Write tests for a given project, i.e., tests for the portal go in `/e2e/tests/portal`.

## Running Tests

To run tests:

```bash
$ npx playwright test
```

To run tests just for a specific browser:

```bash
$ npx playwright test --project=[chromium]
```

To run tests just for a specific frontend, specify by directory:

```bash
$ npx playwright test portal/
```

These can be combined:

````bash
$ npx playwright test --project=chromium portal/
```

To run headed:

```bash
$ npx playwright test --headed
````

To run in UI mode:

```bash
$ npx playwright test --ui
```

To run in debug mode:

```bash
$ npx playwright test --debug
```

To show a report:

```bash
$ npx playwright show-report REPORT_DIR
```

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

### Configure secrets

1. Copy `template.env` --> `.env`
2. Fill in details
