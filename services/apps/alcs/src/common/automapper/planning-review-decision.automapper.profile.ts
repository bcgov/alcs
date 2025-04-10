import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { PlanningReviewDecisionDocument } from '../../alcs/planning-review/planning-review-decision/planning-review-decision-document/planning-review-decision-document.entity';
import { PlanningReviewDecisionOutcomeCode } from '../../alcs/planning-review/planning-review-decision/planning-review-decision-outcome.entity';
import {
  PlanningReviewDecisionDocumentDto,
  PlanningReviewDecisionDto,
  PlanningReviewDecisionOutcomeCodeDto,
} from '../../alcs/planning-review/planning-review-decision/planning-review-decision.dto';
import { PlanningReviewDecision } from '../../alcs/planning-review/planning-review-decision/planning-review-decision.entity';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentTypeDto } from '../../document/document.dto';

@Injectable()
export class PlanningReviewDecisionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        PlanningReviewDecision,
        PlanningReviewDecisionDto,
        forMember(
          (dto) => dto.date,
          mapFrom((entity) => entity.date?.getTime()),
        ),
      );
      createMap(
        mapper,
        PlanningReviewDecisionOutcomeCode,
        PlanningReviewDecisionOutcomeCodeDto,
      );

      createMap(
        mapper,
        PlanningReviewDecisionDocument,
        PlanningReviewDecisionDocumentDto,
        forMember(
          (dto) => dto.mimeType,
          mapFrom((entity) => entity.document.mimeType),
        ),
        forMember(
          (dto) => dto.fileName,
          mapFrom((entity) => entity.document.fileName),
        ),
        forMember(
          (dto) => dto.fileSize,
          mapFrom((entity) => entity.document.fileSize),
        ),
        forMember(
          (dto) => dto.uploadedBy,
          mapFrom((entity) => entity.document.uploadedBy?.name),
        ),
        forMember(
          (dto) => dto.uploadedAt,
          mapFrom((entity) => entity.document.uploadedAt.getTime()),
        ),
        forMember(
          (dto) => dto.documentUuid,
          mapFrom((entity) => entity.document.uuid),
        ),
      );
      createMap(mapper, DocumentCode, DocumentTypeDto);
    };
  }
}
