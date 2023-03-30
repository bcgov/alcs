import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import { SubmittedApplicationOwnerDto } from '../../alcs/application/application.dto';
import { ApplicationOwnerType } from '../../portal/application-submission/application-owner/application-owner-type/application-owner-type.entity';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
  ApplicationOwnerTypeDto,
} from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcelDto } from '../../portal/application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';
import { Document } from '../../document/document.entity';

@Injectable()
export class ApplicationOwnerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    const mapCorporateSummary = (
      corporateSummary: Document | null,
    ): ApplicationDocumentDto | undefined => {
      if (corporateSummary) {
        return {
          uuid: corporateSummary.uuid,
          documentUuid: corporateSummary.uuid,
          mimeType: '',
          fileName: corporateSummary.fileName,
          fileSize: corporateSummary.fileSize,
          uploadedAt: corporateSummary.auditCreatedAt.getDate(),
          uploadedBy: corporateSummary.uploadedBy?.displayName || 'Unknown',
          source: corporateSummary.source,
          description: undefined,
          visibilityFlags: [],
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
          mapFrom((a) => mapCorporateSummary(a.corporateSummary)),
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
          mapFrom((a) => mapCorporateSummary(a.corporateSummary)),
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
      createMap(
        mapper,
        ApplicationOwner,
        SubmittedApplicationOwnerDto,
        forMember(
          (ad) => ad.type,
          mapFrom((a) => a.type.code),
        ),
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) =>
            p.organizationName
              ? p.organizationName
              : `${p.firstName} ${p.lastName}`,
          ),
        ),
      );
    };
  }
}
