import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationOwnerType } from '../../portal/application-submission/application-owner/application-owner-type/application-owner-type.entity';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
  ApplicationOwnerTypeDto,
} from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcelDto } from '../../portal/application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';

@Injectable()
export class ApplicationOwnerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
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
          (pd) => pd.corporateSummary,
          mapFrom((p) =>
            p.corporateSummary
              ? this.mapper.map(
                  p.corporateSummary,
                  ApplicationDocument,
                  ApplicationDocumentDto,
                )
              : undefined,
          ),
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
        forMember(
          (pd) => pd.corporateSummary,
          mapFrom((p) =>
            p.corporateSummary
              ? this.mapper.map(
                  p.corporateSummary,
                  ApplicationDocument,
                  ApplicationDocumentDto,
                )
              : undefined,
          ),
        ),
      );

      createMap(mapper, ApplicationOwnerType, ApplicationOwnerTypeDto);
    };
  }
}
