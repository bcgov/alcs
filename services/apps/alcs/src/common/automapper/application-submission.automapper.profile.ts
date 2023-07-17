import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { AlcsApplicationSubmissionDto } from '../../alcs/application/application.dto';
import { ApplicationSubmissionStatusType } from '../../application-submission-status/submission-status-type.entity';
import {
  ApplicationStatusDto,
  ApplicationSubmissionToSubmissionStatusDto,
} from '../../application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../application-submission-status/submission-status.entity';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
} from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionDto,
  NaruSubtypeDto,
} from '../../portal/application-submission/application-submission.dto';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { NaruSubtype } from '../../portal/application-submission/naru-subtype/naru-subtype.entity';

@Injectable()
export class ApplicationSubmissionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationSubmission,
        ApplicationSubmissionDto,
        forMember(
          (a) => a.createdAt,
          mapFrom((ad) => {
            return ad.auditCreatedAt.getTime();
          }),
        ),
        forMember(
          (a) => a.updatedAt,
          mapFrom((ad) => {
            return ad.auditUpdatedAt?.getTime();
          }),
        ),
        forMember(
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            return ad.status.effectiveDate?.getTime();
          }),
        ),
        forMember(
          (a) => a.status,
          mapFrom((ad) => {
            return ad.status.statusType;
          }),
        ),
        forMember(
          (a) => a.owners,
          mapFrom((ad) => {
            if (ad.owners) {
              return this.mapper.mapArray(
                ad.owners,
                ApplicationOwner,
                ApplicationOwnerDto,
              );
            } else {
              return [];
            }
          }),
        ),
      );

      createMap(mapper, ApplicationSubmissionStatusType, ApplicationStatusDto);
      createMap(mapper, NaruSubtype, NaruSubtypeDto);

      createMap(
        mapper,
        ApplicationSubmission,
        ApplicationSubmissionDetailedDto,
        forMember(
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            return ad.status?.effectiveDate?.getTime();
          }),
        ),
        forMember(
          (a) => a.status,
          mapFrom((ad) => {
            return ad.status.statusType;
          }),
        ),
        forMember(
          (a) => a.createdAt,
          mapFrom((ad) => {
            return ad.auditCreatedAt.getTime();
          }),
        ),
        forMember(
          (a) => a.updatedAt,
          mapFrom((ad) => {
            return ad.auditUpdatedAt?.getTime();
          }),
        ),
        forMember(
          (a) => a.owners,
          mapFrom((ad) => {
            if (ad.owners) {
              return this.mapper.mapArray(
                ad.owners,
                ApplicationOwner,
                ApplicationOwnerDetailedDto,
              );
            } else {
              return [];
            }
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationSubmission,
        AlcsApplicationSubmissionDto,
        forMember(
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            return ad.status?.effectiveDate?.getTime();
          }),
        ),
        forMember(
          (a) => a.status,
          mapFrom((ad) => {
            return ad.status.statusType;
          }),
        ),
        forMember(
          (a) => a.owners,
          mapFrom((ad) => {
            if (ad.owners) {
              return this.mapper.mapArray(
                ad.owners,
                ApplicationOwner,
                ApplicationOwnerDetailedDto,
              );
            } else {
              return [];
            }
          }),
        ),
      );
      createMap(
        mapper,
        ApplicationSubmissionToSubmissionStatus,
        ApplicationSubmissionToSubmissionStatusDto,
        forMember(
          (a) => a.effectiveDate,
          mapFrom((ad) => {
            return ad.effectiveDate?.getTime();
          }),
        ),
        forMember(
          (a) => a.status,
          mapFrom((ad) => {
            return this.mapper.map(
              ad.statusType,
              ApplicationSubmissionStatusType,
              ApplicationStatusDto,
            );
          }),
        ),
      );
    };
  }
}
