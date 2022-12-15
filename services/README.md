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

Typeorm commands are specific by application.

### ALCS:

```bash
# create empty migration file:
  npm run alcs:migration:create --name=<file_name>
# generate migrations:
  npm run alcs:migration:generate --name=<file_name>
# apply migration:
  npm run alcs:migration:run
# revert migration
  npm run alcs:typeorm migration:revert
```

### Portal

```bash
# create empty migration file:
  npm run portal:migration:create --name=<file_name>
# generate migrations:
  npm run portal:migration:generate --name=<file_name>
# apply migration:
  npm run portal:migration:run
# revert migration
  npm run portal:typeorm migration:revert
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

# gRPC

Server communication between ALCS server and Portal server is performed using [gRPC](https://grpc.io/). gRPC uses protocol buffers (\*.proto) as both its Interface Definition Language (IDL) and as its underlying message interchange format.

ALCS and Portal support mutual TLS to ensure secure communication. TLS also enabled for local environment using the self-signed certificates included in the source code. If you need to generate new set of certificates or learn more about the process refer to [certstrap](https://github.com/square/certstrap)

TS implementation of \*.proto files can be provided manually or generated using [ts-proto](https://github.com/stephenh/ts-proto/blob/main/NESTJS.markdown) tool
