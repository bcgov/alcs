import { DataSource } from 'typeorm';
import * as config from 'config';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// this is a typeorm cli specific configuration
export const connectionSource = new DataSource({
  migrationsTableName: config.get<string>('DATABASE_MIGRATION_TABLE'),
  type: 'postgres',
  host: config.get<string>('DATABASE_HOST'),
  port: config.get<number>('DATABASE_PORT'),
  username: config.get<string>('DATABASE_USER'),
  password: config.get<string>('DATABASE_PASSWORD'),
  database: config.get<string>('DATABASE_NAME'),
  synchronize: false,
  name: 'default',
  entities: ['src/**/*.entity.{ts,js}'], // note, this must point to entities folder in src, so cli can discover entities for migration generation
  migrations: [join(__dirname, '**', 'migrations/*{.ts,.js}')],
  namingStrategy: new SnakeNamingStrategy(),
  uuidExtension: 'pgcrypto',
});
