import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationSubmissionReviewDto } from '../../application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReview } from '../../application-submission-review/application-submission-review.entity';

@Injectable()
export class ApplicationReviewProfile extends AutomapperProfile {
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
