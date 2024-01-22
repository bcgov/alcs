import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { AlcsApplicationSubmissionDto } from '../../alcs/application/application.dto';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import {
  ApplicationStatusDto,
  ApplicationSubmissionToSubmissionStatusDto,
} from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
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
import { CovenantTransfereeDto } from '../../portal/application-submission/covenant-transferee/covenant-transferee.dto';
import { CovenantTransferee } from '../../portal/application-submission/covenant-transferee/covenant-transferee.entity';
import { NaruSubtype } from '../../portal/application-submission/naru-subtype/naru-subtype.entity';
import { NotificationTransfereeDto } from '../../portal/notification-submission/notification-transferee/notification-transferee.dto';
import { NotificationTransferee } from '../../portal/notification-submission/notification-transferee/notification-transferee.entity';

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
        CovenantTransferee,
        CovenantTransfereeDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) => `${p.firstName} ${p.lastName}`),
        ),
      );

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
