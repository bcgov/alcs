import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import {
  NoticeOfIntentStatusDto,
  NoticeOfIntentSubmissionToSubmissionStatusDto,
} from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { AlcsNoticeOfIntentSubmissionDto } from '../../alcs/notice-of-intent/notice-of-intent.dto';
import {
  NoticeOfIntentOwnerDetailedDto,
  NoticeOfIntentOwnerDto,
} from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import {
  NoticeOfIntentSubmissionDetailedDto,
  NoticeOfIntentSubmissionDto,
} from '../../portal/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';

// services/apps/alcs/src/portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.dto.ts
@Injectable()
export class NoticeOfIntentSubmissionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        NoticeOfIntentSubmission,
        NoticeOfIntentSubmissionDto,
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
                NoticeOfIntentOwner,
                NoticeOfIntentOwnerDto,
              );
            } else {
              return [];
            }
          }),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentSubmission,
        NoticeOfIntentSubmissionDetailedDto,
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
          (a) => a.status,
          mapFrom((ad) => {
            return ad.status.statusType;
          }),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentSubmissionToSubmissionStatus,
        NoticeOfIntentSubmissionToSubmissionStatusDto,
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
              NoticeOfIntentSubmissionStatusType,
              NoticeOfIntentStatusDto,
            );
          }),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentSubmission,
        AlcsNoticeOfIntentSubmissionDto,
        // TODO uncomment when working on statuses
        // forMember(
        //   (a) => a.lastStatusUpdate,
        //   mapFrom((ad) => {
        //     return ad.status?.effectiveDate?.getTime();
        //   }),
        // ),
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
                NoticeOfIntentOwner,
                NoticeOfIntentOwnerDetailedDto,
              );
            } else {
              return [];
            }
          }),
        ),
      );
    };
  }
}
