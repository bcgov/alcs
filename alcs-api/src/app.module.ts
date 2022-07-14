import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypeOrmModule.forFeature([HealthCheck]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
