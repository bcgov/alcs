import { Module } from '@nestjs/common';
import { ApplicationStatusService } from './application-status.service';
import { ApplicationStatusController } from './application-status.controller';
import { ApplicationStatus } from './application-status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from 'src/application/application.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationStatus]), ApplicationModule],
  providers: [ApplicationStatusService],
  controllers: [ApplicationStatusController],
})
export class ApplicationStatusModule {}
