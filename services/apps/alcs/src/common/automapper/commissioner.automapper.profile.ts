import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { ApplicationDto } from '../../alcs/application/application.dto';
import {
  CommissionerApplicationDto,
  CommissionerPlanningReviewDto,
} from '../../alcs/commissioner/commissioner.dto';
import { PlanningReviewDto } from '../../alcs/planning-review/planning-review.dto';

@Injectable()
export class CommissionerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationDto, CommissionerApplicationDto);
      createMap(mapper, PlanningReviewDto, CommissionerPlanningReviewDto);
    };
  }
}
