import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocumentDto } from '../../application/application-document/application-document.dto';
import { DOCUMENT_TYPE } from '../../application/application-document/application-document.entity';
import { ApplicationOwnerType } from '../../application/application-owner/application-owner-type/application-owner-type.entity';
import {
  ApplicationOwnerDto,
  ApplicationOwnerTypeDto,
} from '../../application/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../application/application-owner/application-owner.entity';

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
            p.firstName ? `${p.firstName} ${p.lastName}` : p.organizationName,
          ),
        ),
        forMember(
          (ad) => ad.corporateSummary,
          mapFrom((a): ApplicationDocumentDto | undefined => {
            if (a.corporateSummary) {
              return {
                uuid: a.corporateSummary.uuid,
                fileName: a.corporateSummary.fileName,
                type: DOCUMENT_TYPE.CORPORATE_SUMMARY,
                fileSize: a.corporateSummary.fileSize,
                uploadedAt: a.corporateSummary.auditCreatedAt.getDate(),
                uploadedBy: a.corporateSummary.uploadedBy.displayName,
              };
            }
            return undefined;
          }),
        ),
      );

      createMap(mapper, ApplicationOwnerType, ApplicationOwnerTypeDto);
    };
  }
}
