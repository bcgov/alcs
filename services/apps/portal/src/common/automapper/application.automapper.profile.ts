import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocumentDto } from '../../application/application-document/application-document.dto';
import { ApplicationDocument } from '../../application/application-document/application-document.entity';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
} from '../../application/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../application/application-owner/application-owner.entity';
import { ApplicationStatusDto } from '../../application/application-status/application-status.dto';
import { ApplicationStatus } from '../../application/application-status/application-status.entity';
import {
  ApplicationDetailedDto,
  ApplicationDto,
} from '../../application/application.dto';
import { Application } from '../../application/application.entity';

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        Application,
        ApplicationDto,
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
          (a) => a.documents,
          mapFrom((ad) => {
            if (ad.documents) {
              return this.mapper.mapArray(
                ad.documents,
                ApplicationDocument,
                ApplicationDocumentDto,
              );
            } else {
              return [];
            }
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

      createMap(
        mapper,
        ApplicationDocument,
        ApplicationDocumentDto,
        forMember(
          (a) => a.uploadedBy,
          mapFrom((ad) => {
            return ad.document.uploadedBy.name;
          }),
        ),
        forMember(
          (a) => a.fileName,
          mapFrom((ad) => {
            return ad.document.fileName;
          }),
        ),
        forMember(
          (a) => a.fileSize,
          mapFrom((ad) => {
            return ad.document.fileSize;
          }),
        ),
      );

      createMap(mapper, ApplicationStatus, ApplicationStatusDto);

      createMap(
        mapper,
        Application,
        ApplicationDetailedDto,
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
          (a) => a.documents,
          mapFrom((ad) => {
            if (ad.documents) {
              return this.mapper.mapArray(
                ad.documents,
                ApplicationDocument,
                ApplicationDocumentDto,
              );
            } else {
              return [];
            }
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
