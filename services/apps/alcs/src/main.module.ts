import { ConfigModule } from '@app/common/config/config.module';
import { RedisModule } from '@app/common/redis/redis.module';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import * as config from 'config';
import { AuthGuard } from 'nest-keycloak-connect';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { CdogsModule } from '../../../libs/common/src/cdogs/cdogs.module';
import { AlcsModule } from './alcs/alcs.module';
import { AuthorizationFilter } from './common/authorization/authorization.filter';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { AuditSubscriber } from './common/entities/audit.subscriber';
import { Configuration } from './common/entities/configuration.entity';
import { TrackingModule } from './common/tracking/tracking.module';
import { DocumentModule } from './document/document.module';
import { FileNumberModule } from './file-number/file-number.module';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { LogoutController } from './logout/logout.controller';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { MaintenanceGuard } from './portal/guards/maintenance.guard';
import { NoticeOfIntentSubmissionModule } from './portal/notice-of-intent-submission/notice-of-intent-submission.module';
import { PortalModule } from './portal/portal.module';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';
import { SchedulerModule } from './queues/scheduler/scheduler.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypeOrmModule.forFeature([HealthCheck, Configuration]),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    DocumentModule,
    AuthorizationModule,
    RedisModule,
    LoggerModule.forRoot({
      pinoHttp: {
        redact: {
          paths: ['req.headers'],
        },
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
    FileNumberModule,
    NoticeOfIntentSubmissionModule,
    TrackingModule,
    SchedulerModule, // this will init BullMQ
  ],
  controllers: [MainController, LogoutController],
  providers: [
    MainService,
    AuditSubscriber,
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard, //Should come before AuthGuard
    },
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
