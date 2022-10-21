# ALCS API
Main API built with NestJS + TypeOrm

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

Create test.json

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## TypeOrm

```bash
# create empty migration file:
  npm run migration:create --name=<file_name>

# generate migrations:
  npm run migration:generate --name=<file_name>
#  or
  npm run typeorm -- migration:generate ./src/providers/typeorm/migrations/<file_name>

# apply migration:
  npm run typeorm migration:run

# revert migration:
  npm run typeorm migration:revert
```

## Postgres tests

Postgres unit tests are implemented using pgTap.

```bash
# run tests
docker-compose up --build pgtap 
```

## Queues

nestjs Bull
use this link for validating/generating cron expressions [crontab.cronhub.io](https://crontab.cronhub.io/)


## Dependency Graph
```bash
npm run graph
```
Paste console output into https://mermaid-js.github.io/mermaid-live-editor and configure
# DATES

**_NOTE:_** ALL DATES ON API MUST BE OF TYPE DATE IN UTC  
**_NOTE:_** ALL DATES IN DB MUST BE TIMESTAMPTZ IN UTC
