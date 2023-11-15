import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationOwnerDto } from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcelDto } from '../../portal/application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';
import {
  ParcelOwnershipType,
  ParcelOwnershipTypeDto,
} from '../entities/parcel-ownership-type/parcel-ownership-type.entity';

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
          (p) => p.certificateOfTitle,
          mapFrom((pd) => {
            if (pd.certificateOfTitle) {
              return this.mapper.map(
                pd.certificateOfTitle,
                ApplicationDocument,
                ApplicationDocumentDto,
              );
            }
            return;
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
                ParcelOwnershipType,
                ParcelOwnershipTypeDto,
              );
            } else {
              return undefined;
            }
          }),
        ),
      );

      createMap(mapper, ParcelOwnershipType, ParcelOwnershipTypeDto);
    };
  }
}
