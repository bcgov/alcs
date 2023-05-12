# ALCS + Portal API

Main API built with NestJS + TypeOrm

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run alcs:start

# watch mode
$ npm run {env}:start:dev

# production mode
$ npm run {env}:start:prod
```

## Test
Create test.json (you could copy values from default.json and tweak them as needed)

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
  npm run alcs:migration:create --name=<file_name>
# generate migrations:
  npm run alcs:migration:generate --name=<file_name>
# apply migration:
  npm run alcs:migration:run
# revert migration
  npm run alcs:typeorm migration:revert
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

# Local Database Backup & Restore

### Backup
- Install & add open shift to path
- Login to with token from silver cluster
- Forward port, usually 5432
```bash
  oc port-forward service/alcs-patroni 5432:5432
  ```
- Add new connection to app with preffered DB tool (DBeaver, TablePlus)
- Backup DB & save dump file. ensure postgresql 12.x is selected
- Stop port forwarding

### Restore
- Connect to local DB 
- In DB tool select restore for app DB
- Select file to restore from
- Ensure postgresql 12.x being used
- If databse does not exist, example *app*, select create option