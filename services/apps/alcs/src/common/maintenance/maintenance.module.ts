import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from '../entities/configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration])],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
