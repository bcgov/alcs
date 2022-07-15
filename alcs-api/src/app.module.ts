import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { ConfigModule } from './common/config/config.module';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypeOrmModule.forFeature([HealthCheck]),
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    AuthorizationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
