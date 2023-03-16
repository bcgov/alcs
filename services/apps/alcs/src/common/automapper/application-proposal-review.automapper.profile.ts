import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationProposalReviewDto } from '../../portal/application-proposal-review/application-proposal-review.dto';
import { ApplicationProposalReview } from '../../portal/application-proposal-review/application-proposal-review.entity';

@Injectable()
export class ApplicationProposalReviewProfile extends AutomapperProfile {
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
