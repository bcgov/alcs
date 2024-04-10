import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { Configuration } from '../../common/entities/configuration.entity';
import { MaintenanceService } from '../../common/maintenance/maintenance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration])],
  providers: [MaintenanceService],
  controllers: [MaintenanceController],
})
export class MaintenanceModule {}
