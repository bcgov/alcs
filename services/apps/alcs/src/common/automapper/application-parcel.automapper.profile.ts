import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { SubmittedApplicationParcelDto } from '../../alcs/application/application.dto';
import { ApplicationOwnerDto } from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcelDocumentDto } from '../../portal/application-submission/application-parcel/application-parcel-document/application-parcel-document.dto';
import { ApplicationParcelDocument } from '../../portal/application-submission/application-parcel/application-parcel-document/application-parcel-document.entity';
import { ApplicationParcelOwnershipType } from '../../portal/application-submission/application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import {
  ApplicationParcelDto,
  ApplicationParcelOwnershipTypeDto,
} from '../../portal/application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';

@Injectable()
export class ApplicationParcelProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationParcel,
        ApplicationParcelDto,
        forMember(
          (pd) => pd.ownershipTypeCode,
          mapFrom((p) => p.ownershipTypeCode),
        ),
        forMember(
          (pd) => pd.purchasedDate,
          mapFrom((p) => p.purchasedDate?.getTime()),
        ),
        forMember(
          (p) => p.documents,
          mapFrom((pd) => {
            if (pd.documents) {
              return this.mapper.mapArray(
                pd.documents,
                ApplicationParcelDocument,
                ApplicationParcelDocumentDto,
              );
            } else {
              return [];
            }
          }),
        ),
        forMember(
          (p) => p.owners,
          mapFrom((pd) => {
            if (pd.owners) {
              return this.mapper.mapArray(
                pd.owners,
                ApplicationOwner,
                ApplicationOwnerDto,
              );
            } else {
              return [];
            }
          }),
        ),
        forMember(
          (p) => p.ownershipType,
          mapFrom((pd) => {
            if (pd.ownershipType) {
              return this.mapper.map(
                pd.ownershipType,
                ApplicationParcelOwnershipType,
                ApplicationParcelOwnershipTypeDto,
              );
            } else {
              return undefined;
            }
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationParcelDocument,
        ApplicationParcelDocumentDto,
        forMember(
          (a) => a.uploadedBy,
          mapFrom((ad) => {
            return ad.document.uploadedBy?.name;
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
        forMember(
          (a) => a.documentUuid,
          mapFrom((ad) => {
            return ad.document.uuid;
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationParcelOwnershipType,
        ApplicationParcelOwnershipTypeDto,
      );

      createMap(
        mapper,
        ApplicationParcel,
        SubmittedApplicationParcelDto,
        forMember(
          (a) => a.documents,
          mapFrom((ad) => {
            if (ad.documents) {
              return this.mapper.mapArray(
                ad.documents,
                ApplicationParcelDocument,
                ApplicationParcelDocumentDto,
              );
            } else {
              return [];
            }
          }),
        ),
        forMember(
          (a) => a.ownershipType,
          mapFrom((ad) => ad.ownershipType.description),
        ),
      );
    };
  }
}
