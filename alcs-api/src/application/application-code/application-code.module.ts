import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { ApplicationCodeController } from './application-code.controller';
import { ApplicationCodeService } from './application-code.service';
import { ApplicationRegion } from './application-region/application-region.entity';
import { ApplicationType } from './application-type/application-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationStatus,
      ApplicationType,
      ApplicationRegion,
    ]),
  ],
  providers: [ApplicationCodeService],
  controllers: [ApplicationCodeController],
  exports: [ApplicationCodeService],
})
export class ApplicationCodeModule {}
