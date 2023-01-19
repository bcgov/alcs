import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationParcelDocumentDto } from '../../application/application-parcel/application-parcel-document/application-parcel-document.dto';
import { ApplicationParcelDocument } from '../../application/application-parcel/application-parcel-document/application-parcel-document.entity';
import { ApplicationParcelDto } from '../../application/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../application/application-parcel/application-parcel.entity';

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
    };
  }
}
