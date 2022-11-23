import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as config from 'config';
import { AuthGuard } from 'nest-keycloak-connect';
import { LoggerModule } from 'nestjs-pino';
import { AuthorizationFilter } from './common/authorization/authorization.filter';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { ConfigModule } from './common/config/config.module';
import { LogoutController } from './logout/logout.controller';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    AuthorizationModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.get('LOG_LEVEL'),
        autoLogging: false, //Disable auto-logging every request/response
        transport:
          config.get('ENV') === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'mmm-dd h:MM:ss',
                  ignore: 'hostname',
                },
              }
            : undefined,
      },
    }),
  ],
  controllers: [PortalController, LogoutController],
  providers: [
    PortalService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AuthorizationFilter,
    },
  ],
})
export class PortalModule {}
