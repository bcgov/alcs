# End-to-End Testing

- [Usage](#usage)
- [Local Setup](#local-setup)
  - [Installation](#installation)
  - [Configure secrets](#configure-secrets)

E2E test automation is implemented using the [Playwright](https://playwright.dev/).

> [!WARNING]
> When writing tests, make sure they do not contain any credentials _before_ committing to the repo.

## Usage

To run tests:

```bash
$ npx playwright test
```

To run tests just for a specific project:

```bash
$ npx playwright test --project=[portal]
```

For now, `portal` is the only project.

To run headed:

```bash
$ npx playwright test --headed
```

To run in UI mode:

```bash
$ npx playwright test --ui
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
