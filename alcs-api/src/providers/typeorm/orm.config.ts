import { IConfig } from 'config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

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
  namingStrategy: new SnakeNamingStrategy(),
});

export const getOrmConfig = (config: IConfig) => ({
  ...getTypeOrmModuleOptions(config),
  migrationsTableName: config.get<string>('DATABASE_MIGRATION_TABLE'),
  migrations: [join(__dirname, '**', 'migrations/*{.ts,.js}')],
  cli: {
    migrationsDir: [join(__dirname, '**', 'migrations')],
  },
});
