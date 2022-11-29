import * as config from 'config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PORTAL_DATABASE_SCHEMA } from './orm.config';

// this is a typeorm cli specific configuration
export const connectionSource = new DataSource({
  migrationsTableName: config.get<string>('DATABASE.MIGRATION_TABLE'),
  type: 'postgres',
  host: config.get<string>('DATABASE.HOST'),
  port: config.get<number>('DATABASE.PORT'),
  username: config.get<string>('DATABASE.USER'),
  password: config.get<string>('DATABASE.PASSWORD'),
  database: config.get<string>('DATABASE.NAME'),
  schema: PORTAL_DATABASE_SCHEMA,
  synchronize: false,
  name: 'default',
  entities: ['apps/portal/src/**/*.entity.{ts,js}'], // note, this must point to entities folder in src, so cli can discover entities for migration generation
  migrations: [join(__dirname, '**', 'migrations/*{.ts,.js}')],
  namingStrategy: new SnakeNamingStrategy(),
  uuidExtension: 'pgcrypto',
});
