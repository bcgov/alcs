import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationProposalReviewDto } from '../../application-review/application-proposal-review.dto';
import { ApplicationProposalReview } from '../../application-review/application-proposal-review.entity';

@Injectable()
export class ApplicationReviewProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationProposalReview,
        ApplicationProposalReviewDto,
      );
    };
  }
}
