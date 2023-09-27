import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationDecisionMakerCode } from '../application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationSubmissionStatusType } from '../application/application-submission-status/submission-status-type.entity';
import { ReconsiderationProfile } from '../../common/automapper/reconsideration.automapper.profile';
import { ApplicationReconsiderationType } from '../application-decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CardStatus } from '../card/card-status/card-status.entity';

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
      ApplicationSubmissionStatusType,
      ApplicationDecisionMakerCode,
    ]),
  ],
  providers: [CodeService, ReconsiderationProfile],
  controllers: [CodeController],
  exports: [CodeService],
})
export class CodeModule {}
