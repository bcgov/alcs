import { IConfig } from 'config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const getTypeOrmModuleOptions = (
  config: IConfig,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DATABASE_HOST'),
  port: config.get<number>('DATABASE_PORT'),
  username: config.get<string>('DATABASE_USER'),
  password: config.get<string>('DATABASE_PASSWORD'),
  database: config.get<string>('DATABASE_NAME'),
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  /* Note : it is unsafe to use synchronize: true for schema synchronization
    on production once you get data in your database. */
  synchronize: true,
  autoLoadEntities: true,
});

export const getOrmConfig = (config: IConfig) => ({
  ...getTypeOrmModuleOptions(config),
  migrationsTableName: 'migrations',
  migrations: [join(__dirname, '**', 'migrations/*{.ts,.js}')],
  cli: {
    migrationsDir: [join(__dirname, '**', 'migrations')],
  },
});

export const createConnectionSource = (ormConfig: PostgresConnectionOptions) =>
  new DataSource({
    migrationsTableName: ormConfig.migrationsTableName,
    type: ormConfig.type,
    host: ormConfig.host,
    port: ormConfig.port,
    username: ormConfig.username,
    password: ormConfig.password,
    database: ormConfig.database,
    logging: ormConfig.logging,
    synchronize: ormConfig.synchronize,
    name: 'default',
    entities: ['src/**/*.entity.{ts,js}'], // note, this must point to entities folder in src, so cli can discover entities for migration generation
    migrations: ormConfig.migrations,
  });
