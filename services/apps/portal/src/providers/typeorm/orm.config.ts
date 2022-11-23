import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const PORTAL_DATABASE_SCHEMA = 'portal';

export const getTypeOrmModuleOptions = (
  config: IConfig,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DATABASE.HOST'),
  port: config.get<number>('DATABASE.PORT'),
  username: config.get<string>('DATABASE.USER'),
  password: config.get<string>('DATABASE.PASSWORD'),
  database: config.get<string>('DATABASE.NAME'),
  schema: PORTAL_DATABASE_SCHEMA,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  synchronize: false,
  autoLoadEntities: true,
  namingStrategy: new SnakeNamingStrategy(),
  uuidExtension: 'pgcrypto',
});

export const getOrmConfig = (config: IConfig) => ({
  ...getTypeOrmModuleOptions(config),
  migrationsTableName: config.get<string>('DATABASE.MIGRATION_TABLE'),
  migrations: [join(__dirname, '**', 'migrations/*{.ts,.js}')],
  cli: {
    migrationsDir: [join(__dirname, '**', 'migrations')],
  },
});
