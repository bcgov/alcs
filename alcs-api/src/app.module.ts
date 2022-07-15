import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';
import { ApplicationModule } from './application/application.module';
import { ApplicationStatusModule } from './application-status/application-status.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypeOrmModule.forFeature([HealthCheck]),
    ApplicationModule,
    ApplicationStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
