import { ConfigModule } from '@app/common/config/config.module';
import { RedisModule } from '@app/common/redis/redis.module';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as config from 'config';
import { AuthGuard } from 'nest-keycloak-connect';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { CdogsModule } from '../../../libs/common/src/cdogs/cdogs.module';
import { AlcsModule } from './alcs/alcs.module';
import { AuthorizationFilter } from './common/authorization/authorization.filter';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { AuditSubscriber } from './common/entities/audit.subscriber';
import { DocumentGrpcModule } from './document-grpc/document-grpc.module';
import { DocumentModule } from './document/document.module';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { LogoutController } from './logout/logout.controller';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { PortalModule } from './portal/portal.module';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypeOrmModule.forFeature([HealthCheck, User]),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ClsModule.register({
      global: true,
      middleware: { mount: true },
    }),
    DocumentModule,
    DocumentGrpcModule,
    AuthorizationModule,
    RedisModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.get('LOG_LEVEL'),
        autoLogging: false, //Disable auto-logging every request/response for now
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
    CdogsModule,
    AlcsModule,
    PortalModule,
    UserModule,
  ],
  controllers: [MainController, LogoutController],
  providers: [
    MainService,
    UserService,
    AuditSubscriber,
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
export class MainModule {}
