import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const ALCS_DATABASE_SCHEMA = 'alcs';

export const getTypeOrmModuleOptions = (
  config: IConfig,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    schema: ALCS_DATABASE_SCHEMA,
    entities: [join(__dirname, '**', '*.{ts,js}')],
    synchronize: false,
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
    uuidExtension: 'pgcrypto',
    applicationName: 'alcs',
    replication: {
      defaultMode: 'master',
      master: {
        host: config.get<string>('DATABASE.MASTER.HOST'),
        port: config.get<number>('DATABASE.MASTER.PORT'),
        username: config.get<string>('DATABASE.MASTER.USER'),
        password: config.get<string>('DATABASE.MASTER.PASSWORD'),
        database: config.get<string>('DATABASE.MASTER.NAME'),
      },
      slaves: [
        {
          host: config.get<string>('DATABASE.SLAVE.HOST'),
          port: config.get<number>('DATABASE.SLAVE.PORT'),
          username: config.get<string>('DATABASE.SLAVE.USER'),
          password: config.get<string>('DATABASE.SLAVE.PASSWORD'),
          database: config.get<string>('DATABASE.SLAVE.NAME'),
        },
      ],
    },
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
