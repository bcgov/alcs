# Pre-Requisites

## Software

* [Node 20.x](https://nodejs.org/en/download) with NPM
* [Docker desktop](https://www.docker.com/products/docker-desktop/) installed and running
* IDE of your choice
* SQL GUI tool ([DBeaver](https://dbeaver.io/) or [TablePlus](https://tableplus.com/))
* Openshift CLI (if working with Openshift environments)

## Setup

* There is a docker-compose.yml in the services folder that is used for running the required services (Postgres, Redis,
  MinIO, ClamAV) for the backend
* Run docker compose up from within the services folder to start this
* Connect to the local database using the default credentials: postgres/postgres
* Set up the database and create the initial schemas.
* ``
  CREATE SCHEMA IF NOT EXISTS alcs;
  CREATE SCHEMA IF NOT EXISTS override;``
* Run ``npm i`` in the services folder
  Ask a developer for their development.json and place inside the config folder, this will configure the environment
  with the correct secrets and settings
  to point to a local instance
* Run ``npm run alcs:migration:run`` in the services folder to create the database tables and seed data

* You are ready to run all the projects! Move onto the next readmes to learn more about each specific folder / project