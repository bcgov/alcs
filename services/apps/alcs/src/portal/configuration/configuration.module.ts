import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { Configuration } from '../../common/entities/configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration])],
  providers: [ConfigurationService],
  controllers: [ConfigurationController],
})
export class ConfigurationModule {}
