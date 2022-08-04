import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import * as config from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationModule } from './application/application.module';
import { AuthorizationFilter } from './common/authorization/authorization.filter';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { ConfigModule } from './common/config/config.module';
import { AuditSubscriber } from './common/entities/audit.subscriber';
import { RedisModule } from './common/redis/redis.module';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypeOrmModule.forFeature([HealthCheck, User]),
    ClsModule.register({
      global: true,
      middleware: { mount: true },
    }),
    ApplicationModule,
    CommentModule,
    ConfigModule,
    AuthorizationModule,
    RedisModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
export class AppModule {}
