import * as config from 'config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ALCS_DATABASE_SCHEMA } from './orm.config';

// this is a typeorm cli specific configuration
export const connectionSource = new DataSource({
  migrationsTableName: config.get<string>('DATABASE.MIGRATION_TABLE'),
  type: 'postgres',
  host: config.get<string>('DATABASE.MASTER.HOST'),
  port: config.get<number>('DATABASE.MASTER.PORT'),
  username: config.get<string>('DATABASE.MASTER.USER'),
  password: config.get<string>('DATABASE.MASTER.PASSWORD'),
  database: config.get<string>('DATABASE.MASTER.NAME'),
  schema: ALCS_DATABASE_SCHEMA,
  synchronize: false,
  name: 'default',
  entities: ['apps/alcs/src/**/*.entity.{ts,js}'], // note, this must point to entities folder in src, so cli can discover entities for migration generation
  migrations: [join(__dirname, '**', 'migrations/*{.ts,.js}')],
  namingStrategy: new SnakeNamingStrategy(),
  uuidExtension: 'pgcrypto',
  maxQueryExecutionTime: 500,
});
