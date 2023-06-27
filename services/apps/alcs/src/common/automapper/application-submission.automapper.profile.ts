import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { AlcsApplicationSubmissionDto } from '../../alcs/application/application.dto';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
} from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationStatusDto } from '../../portal/application-submission/application-status/application-status.dto';
import { ApplicationStatus } from '../../portal/application-submission/application-status/application-status.entity';
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
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            if (ad.statusHistory.length > 0) {
              return ad.statusHistory[0].time;
            }
            return Date.now();
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

      createMap(mapper, ApplicationStatus, ApplicationStatusDto);
      createMap(mapper, NaruSubtype, NaruSubtypeDto);

      createMap(
        mapper,
        ApplicationSubmission,
        ApplicationSubmissionDetailedDto,
        forMember(
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            if (ad.statusHistory.length > 0) {
              return ad.statusHistory[0].time;
            }
            //For older applications before status history was created
            return Date.now();
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
            if (ad.statusHistory.length > 0) {
              return ad.statusHistory[0].time;
            }
            //For older applications before status history was created
            return Date.now();
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
    };
  }
}
