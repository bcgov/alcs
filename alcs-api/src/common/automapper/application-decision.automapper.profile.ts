import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { DecisionOutcomeCode } from '../../application/application-decision/application-decision-outcome.entity';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeTypeDto,
  DecisionDocumentDto,
} from '../../application/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../application/application-decision/application-decision.entity';
import { CeoCriterionCodeDto } from '../../application/application-decision/ceo-criterion/ceo-criterion.dto';
import { CeoCriterionCode } from '../../application/application-decision/ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from '../../application/application-decision/decision-document.entity';
import { DecisionMakerCodeDto } from '../../application/application-decision/decision-maker/decision-maker.dto';
import { DecisionMakerCode } from '../../application/application-decision/decision-maker/decision-maker.entity';

@Injectable()
export class ApplicationDecisionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationDecision,
        ApplicationDecisionDto,
        forMember(
          (ad) => ad.documents,
          mapFrom((a) =>
            this.mapper.mapArray(
              a.documents,
              DecisionDocument,
              DecisionDocumentDto,
            ),
          ),
        ),
      );

      createMap(mapper, DecisionOutcomeCode, ApplicationDecisionOutcomeTypeDto);

      createMap(mapper, DecisionMakerCode, DecisionMakerCodeDto);

      createMap(mapper, CeoCriterionCode, CeoCriterionCodeDto);

      createMap(
        mapper,
        DecisionDocument,
        DecisionDocumentDto,
        forMember(
          (a) => a.mimeType,
          mapFrom((ad) => {
            return ad.document.mimeType;
          }),
        ),
        forMember(
          (a) => a.fileName,
          mapFrom((ad) => {
            return ad.document.fileName;
          }),
        ),
        forMember(
          (a) => a.uploadedBy,
          mapFrom((ad) => {
            return ad.document.uploadedBy.name;
          }),
        ),
        forMember(
          (a) => a.uploadedAt,
          mapFrom((ad) => {
            return ad.document.uploadedAt.getTime();
          }),
        ),
      );
    };
  }
}
