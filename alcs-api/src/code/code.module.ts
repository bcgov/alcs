import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationReconsiderationType } from '../decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CardStatus } from '../card/card-status/card-status.entity';
import { ReconsiderationProfile } from '../common/automapper/reconsideration.automapper.profile';

import { ApplicationMeetingType } from './application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegion } from './application-code/application-region/application-region.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardStatus,
      ApplicationType,
      ApplicationRegion,
      ApplicationMeetingType,
      ApplicationReconsiderationType,
    ]),
  ],
  providers: [CodeService, ReconsiderationProfile],
  controllers: [CodeController],
  exports: [CodeService],
})
export class CodeModule {}
