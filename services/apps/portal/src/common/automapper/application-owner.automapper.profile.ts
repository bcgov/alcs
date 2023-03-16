import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocumentDto } from '../../application-submission/application-document/application-document.dto';
import { DOCUMENT_TYPE } from '../../application-submission/application-document/application-document.entity';
import { ApplicationOwnerType } from '../../application-submission/application-owner/application-owner-type/application-owner-type.entity';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
  ApplicationOwnerTypeDto,
} from '../../application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../application-submission/application-owner/application-owner.entity';
import { ApplicationParcelDto } from '../../application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../application-submission/application-parcel/application-parcel.entity';

@Injectable()
export class ApplicationOwnerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    const mapCorporateSummary = (a): ApplicationDocumentDto | undefined => {
      if (a.corporateSummary) {
        return {
          uuid: a.corporateSummary.uuid,
          fileName: a.corporateSummary.fileName,
          type: DOCUMENT_TYPE.CORPORATE_SUMMARY,
          fileSize: a.corporateSummary.fileSize,
          uploadedAt: a.corporateSummary.auditCreatedAt.getDate(),
          uploadedBy: a.corporateSummary.uploadedBy.displayName,
          description: null,
        };
      }
      return undefined;
    };

    return (mapper) => {
      createMap(
        mapper,
        ApplicationOwner,
        ApplicationOwnerDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) =>
            p.organizationName
              ? p.organizationName
              : `${p.firstName} ${p.lastName}`,
          ),
        ),
        forMember(
          (ad) => ad.corporateSummary,
          mapFrom((a) => mapCorporateSummary(a)),
        ),
      );

      createMap(
        mapper,
        ApplicationOwner,
        ApplicationOwnerDetailedDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) =>
            p.organizationName
              ? p.organizationName
              : `${p.firstName} ${p.lastName}`,
          ),
        ),
        forMember(
          (ad) => ad.corporateSummary,
          mapFrom((a) => mapCorporateSummary(a)),
        ),
        forMember(
          (ad) => ad.parcels,
          mapFrom((a) => {
            if (a.parcels) {
              return this.mapper.mapArray(
                a.parcels,
                ApplicationParcel,
                ApplicationParcelDto,
              );
            }
          }),
        ),
      );

      createMap(mapper, ApplicationOwnerType, ApplicationOwnerTypeDto);
    };
  }
}
