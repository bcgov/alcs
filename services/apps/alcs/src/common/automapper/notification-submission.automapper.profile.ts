import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationSubmissionStatusType } from '../../alcs/notification/notification-submission-status/notification-status-type.entity';
import {
  NotificationStatusDto,
  NotificationSubmissionToSubmissionStatusDto,
} from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from '../../alcs/notification/notification-submission-status/notification-status.entity';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
} from '../../portal/notification-submission/notification-submission.dto';
import { NotificationSubmission } from '../../portal/notification-submission/notification-submission.entity';

@Injectable()
export class NotificationSubmissionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        NotificationSubmission,
        NotificationSubmissionDto,
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
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            return ad.status?.effectiveDate?.getTime();
          }),
        ),
      );

      createMap(
        mapper,
        NotificationSubmission,
        NotificationSubmissionDetailedDto,
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
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            return ad.status?.effectiveDate?.getTime();
          }),
        ),
      );

      createMap(
        mapper,
        NotificationSubmissionStatusType,
        NotificationStatusDto,
      );

      createMap(
        mapper,
        NotificationSubmissionToSubmissionStatus,
        NotificationSubmissionToSubmissionStatusDto,
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
              NotificationSubmissionStatusType,
              NotificationStatusDto,
            );
          }),
        ),
      );
    };
  }
}
