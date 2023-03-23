import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationSubmissionReviewDto } from '../../portal/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReview } from '../../portal/application-submission-review/application-submission-review.entity';

@Injectable()
export class ApplicationSubmissionReviewProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationSubmissionReview,
        ApplicationSubmissionReviewDto,
      );
    };
  }
}
