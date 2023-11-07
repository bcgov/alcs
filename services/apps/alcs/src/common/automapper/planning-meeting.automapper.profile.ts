import { createMap, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { PlanningReviewDto } from '../../alcs/planning-review/planning-review.dto';
import { PlanningReview } from '../../alcs/planning-review/planning-review.entity';

@Injectable()
export class PlanningReviewProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, PlanningReview, PlanningReviewDto);
    };
  }
}
