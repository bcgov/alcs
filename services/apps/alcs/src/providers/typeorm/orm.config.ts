import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// TODO status replace this with correct schema
export const ALCS_DATABASE_SCHEMA = 'alcs';

export const getTypeOrmModuleOptions = (
  config: IConfig,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: config.get<string>('DATABASE.HOST'),
    port: config.get<number>('DATABASE.PORT'),
    username: config.get<string>('DATABASE.USER'),
    password: config.get<string>('DATABASE.PASSWORD'),
    database: config.get<string>('DATABASE.NAME'),
    schema: ALCS_DATABASE_SCHEMA,
    entities: [join(__dirname, '**', '*.{ts,js}')],
    synchronize: false,
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
    uuidExtension: 'pgcrypto',
    applicationName: 'alcs',
  };
};

export const getOrmConfig = (config: IConfig) => ({
  ...getTypeOrmModuleOptions(config),
  migrationsTableName: config.get<string>('DATABASE.MIGRATION_TABLE'),
  migrations: [join(__dirname, '**', 'migrations/*{.ts,.js}')],
  cli: {
    migrationsDir: [join(__dirname, '**', 'migrations')],
  },
});
