import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDecisionOutcome } from '../../application/application-decision/application-decision-outcome.entity';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutComeDto,
  DecisionDocumentDto,
} from '../../application/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../application/application-decision/application-decision.entity';
import { DecisionDocument } from '../../application/application-decision/decision-document.entity';

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
        forMember(
          (ad) => ad.outcome,
          mapFrom((ad) => {
            return ad.outcome.code;
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionOutcome,
        ApplicationDecisionOutComeDto,
      );

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
