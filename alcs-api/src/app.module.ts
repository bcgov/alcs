import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { ConfigModule } from './common/config/config.module';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { KeycloakConfigService } from './providers/keycloak/keycloak-config.service';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';

@Module({
  imports: [
    AuthorizationModule,
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypeOrmModule.forFeature([HealthCheck]),
    TypeOrmModule.forFeature([User]),
    ConfigModule,
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
