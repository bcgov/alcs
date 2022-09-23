import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardStatus } from '../application-status/card-status.entity';
import { ApplicationCodeController } from './application-code.controller';
import { ApplicationCodeService } from './application-code.service';
import { ApplicationMeetingType } from './application-meeting-type/application-meeting-type.entity';
import { ApplicationRegion } from './application-region/application-region.entity';
import { ApplicationType } from './application-type/application-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardStatus,
      ApplicationType,
      ApplicationRegion,
      ApplicationMeetingType,
    ]),
  ],
  providers: [ApplicationCodeService],
  controllers: [ApplicationCodeController],
  exports: [ApplicationCodeService],
})
export class ApplicationCodeModule {}
