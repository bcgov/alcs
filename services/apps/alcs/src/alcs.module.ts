import { ConfigModule } from '@app/common/config/config.module';
import { EmailTemplateServiceService } from '@app/common/email-template-service/email-template-service.service';
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
import { AdminModule } from './admin/admin.module';
import { AlcsController } from './alcs.controller';
import { AlcsService } from './alcs.service';
import { ApplicationGrpcModule } from './application-grpc/application-grpc.module';
import { ApplicationModule } from './application/application.module';
import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { CommissionerModule } from './commissioner/commissioner.module';
import { AuthorizationFilter } from './common/authorization/authorization.filter';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { AuditSubscriber } from './common/entities/audit.subscriber';
import { CovenantModule } from './covenant/covenant.module';
import { DecisionModule } from './decision/decision.module';
import { DocumentGrpcModule } from './document-grpc/document-grpc.module';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { HomeModule } from './home/home.module';
import { ImportModule } from './import/import.module';
import { LogoutController } from './logout/logout.controller';
import { NotificationModule } from './notification/notification.module';
import { PlanningReviewModule } from './planning-review/planning-review.module';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';
import { SchedulerModule } from './queues/scheduler/scheduler.module';
import { User } from './user/user.entity';
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
    ApplicationModule,
    ApplicationGrpcModule,
    DocumentGrpcModule,
    CommentModule,
    AuthorizationModule,
    RedisModule,
    SchedulerModule,
    HomeModule,
    NotificationModule,
    BoardModule,
    PlanningReviewModule,
    CovenantModule,
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
    CommissionerModule,
    ImportModule,
    DecisionModule,
    AdminModule,
  ],
  controllers: [AlcsController, LogoutController],
  providers: [
    // TODO create a module
    EmailTemplateServiceService,
    AlcsService,
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
export class AlcsModule {}
