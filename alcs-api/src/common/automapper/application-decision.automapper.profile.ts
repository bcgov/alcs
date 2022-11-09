import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { DecisionOutcomeCode } from '../../decision/application-decision/application-decision-outcome.entity';
import {
  ApplicationDecisionDto,
  DecisionOutcomeCodeDto,
  DecisionDocumentDto,
} from '../../decision/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../decision/application-decision/application-decision.entity';
import { CeoCriterionCodeDto } from '../../decision/application-decision/ceo-criterion/ceo-criterion.dto';
import { CeoCriterionCode } from '../../decision/application-decision/ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from '../../decision/application-decision/decision-document.entity';
import { DecisionMakerCodeDto } from '../../decision/application-decision/decision-maker/decision-maker.dto';
import { DecisionMakerCode } from '../../decision/application-decision/decision-maker/decision-maker.entity';

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
              a.documents || [],
              DecisionDocument,
              DecisionDocumentDto,
            ),
          ),
        ),
        forMember(
          (a) => a.reconsiders,
          mapFrom((dec) =>
            dec.reconsiders
              ? {
                  uuid: dec.reconsiders.uuid,
                  linkedResolutions: dec.reconsiders.reconsidersDecisions.map(
                    (decision) =>
                      `#${decision.resolutionNumber}/${dec.resolutionYear}`,
                  ),
                }
              : undefined,
          ),
        ),
        forMember(
          (a) => a.amends,
          mapFrom((dec) =>
            dec.amends
              ? {
                  uuid: dec.amends.uuid,
                  linkedResolutions: dec.amends.amendsDecisions.map(
                    (decision) =>
                      `#${decision.resolutionNumber}/${dec.resolutionYear}`,
                  ),
                }
              : undefined,
          ),
        ),
        forMember(
          (a) => a.reconsideredBy,
          mapFrom((dec) =>
            (dec.reconsideredBy || [])
              .filter((reconsideration) => reconsideration.resultingDecision)
              .map((reconsideration) => ({
                uuid: reconsideration.uuid,
                linkedResolutions: [
                  `#${reconsideration.resultingDecision!.resolutionNumber}/${
                    reconsideration.resultingDecision!.resolutionYear
                  }`,
                ],
              })),
          ),
        ),
        forMember(
          (a) => a.amendedBy,
          mapFrom((dec) =>
            (dec.amendedBy || [])
              .filter((amendment) => amendment.resultingDecision)
              .map((amendment) => ({
                uuid: amendment.uuid,
                linkedResolutions: [
                  `#${amendment.resultingDecision!.resolutionNumber}/${
                    amendment.resultingDecision!.resolutionYear
                  }`,
                ],
              })),
          ),
        ),
        forMember(
          (a) => a.amends,
          mapFrom((dec) =>
            dec.amends
              ? {
                  uuid: dec.amends.uuid,
                  linkedResolutions: dec.amends.amendsDecisions.map(
                    (decision) =>
                      `#${decision.resolutionNumber}/${dec.resolutionYear}`,
                  ),
                }
              : undefined,
          ),
        ),
      );

      createMap(mapper, DecisionOutcomeCode, DecisionOutcomeCodeDto);
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
