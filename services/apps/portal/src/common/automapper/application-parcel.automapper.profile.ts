import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationOwnerDto } from '../../application-proposal/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../application-proposal/application-owner/application-owner.entity';
import { ApplicationParcelDocumentDto } from '../../application-proposal/application-parcel/application-parcel-document/application-parcel-document.dto';
import { ApplicationParcelDocument } from '../../application-proposal/application-parcel/application-parcel-document/application-parcel-document.entity';
import { ApplicationParcelOwnershipType } from '../../application-proposal/application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import {
  ApplicationParcelDto,
  ApplicationParcelOwnershipTypeDto,
} from '../../application-proposal/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../application-proposal/application-parcel/application-parcel.entity';

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

      createMap(
        mapper,
        ApplicationParcelOwnershipType,
        ApplicationParcelOwnershipTypeDto,
      );
    };
  }
}
