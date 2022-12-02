#!/bin/sh
env
echo "Beginning migration..."
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d ./src/providers/typeorm/datasource.cli.orm.config.ts