import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { PlanningReferral } from '../../alcs/planning-review/planning-referral/planning-referral.entity';
import { PlanningReviewType } from '../../alcs/planning-review/planning-review-type.entity';
import {
  PlanningReferralDto,
  PlanningReviewDto,
  PlanningReviewTypeDto,
} from '../../alcs/planning-review/planning-review.dto';
import { PlanningReview } from '../../alcs/planning-review/planning-review.entity';

@Injectable()
export class PlanningReviewProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, PlanningReviewType, PlanningReviewTypeDto);
      createMap(mapper, PlanningReview, PlanningReviewDto);
      createMap(
        mapper,
        PlanningReferral,
        PlanningReferralDto,
        forMember(
          (dto) => dto.dueDate,
          mapFrom((entity) => entity.dueDate?.getTime()),
        ),
        forMember(
          (dto) => dto.submissionDate,
          mapFrom((entity) => entity.submissionDate?.getTime()),
        ),
      );
    };
  }
}
