import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  NoticeOfIntentSubmissionDetailedDto,
  NoticeOfIntentSubmissionDto,
} from '../../portal/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';

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
      );
    };
  }
}
