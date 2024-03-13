import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { PlanningReferral } from '../../alcs/planning-review/planning-referral/planning-referral.entity';
import { PlanningReviewDocumentDto } from '../../alcs/planning-review/planning-review-document/planning-review-document.dto';
import { PlanningReviewDocument } from '../../alcs/planning-review/planning-review-document/planning-review-document.entity';
import { PlanningReviewType } from '../../alcs/planning-review/planning-review-type.entity';
import {
  PlanningReferralDto,
  PlanningReviewDetailedDto,
  PlanningReviewDto,
  PlanningReviewTypeDto,
} from '../../alcs/planning-review/planning-review.dto';
import { PlanningReview } from '../../alcs/planning-review/planning-review.entity';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentTypeDto } from '../../document/document.dto';

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
        forMember(
          (dto) => dto.responseDate,
          mapFrom((entity) => entity.responseDate?.getTime()),
        ),
      );
      createMap(mapper, PlanningReview, PlanningReviewDetailedDto);

      createMap(
        mapper,
        PlanningReviewDocument,
        PlanningReviewDocumentDto,
        forMember(
          (a) => a.mimeType,
          mapFrom((ad) => ad.document.mimeType),
        ),
        forMember(
          (a) => a.fileName,
          mapFrom((ad) => ad.document.fileName),
        ),
        forMember(
          (a) => a.fileSize,
          mapFrom((ad) => ad.document.fileSize),
        ),
        forMember(
          (a) => a.uploadedBy,
          mapFrom((ad) => ad.document.uploadedBy?.name),
        ),
        forMember(
          (a) => a.uploadedAt,
          mapFrom((ad) => ad.document.uploadedAt.getTime()),
        ),
        forMember(
          (a) => a.documentUuid,
          mapFrom((ad) => ad.document.uuid),
        ),
        forMember(
          (a) => a.source,
          mapFrom((ad) => ad.document.source),
        ),
        forMember(
          (a) => a.system,
          mapFrom((ad) => ad.document.system),
        ),
      );
      createMap(mapper, DocumentCode, DocumentTypeDto);
    };
  }
}
