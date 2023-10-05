import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationSubmissionReview } from '../../portal/application-submission-review/application-submission-review.entity';
import { ApplicationOwnerDto } from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcelDto } from '../../portal/application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import {
  PublicApplicationParcelDto,
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
  PublicDocumentDto,
  PublicOwnerDto,
} from '../../portal/public/public.dto';
import {
  ParcelOwnershipType,
  ParcelOwnershipTypeDto,
} from '../entities/parcel-ownership-type/parcel-ownership-type.entity';

@Injectable()
export class PublicAutomapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationSubmission,
        PublicApplicationSubmissionDto,
        forMember(
          (a) => a.lastStatusUpdate,
          mapFrom((ad) => {
            return ad.status.effectiveDate?.getTime();
          }),
        ),
        forMember(
          (a) => a.status,
          mapFrom((ad) => {
            return ad.status.statusType;
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationOwner,
        PublicOwnerDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) => `${p.firstName} ${p.lastName}`),
        ),
      );

      createMap(
        mapper,
        ApplicationParcel,
        PublicApplicationParcelDto,
        forMember(
          (pd) => pd.ownershipTypeCode,
          mapFrom((p) => p.ownershipTypeCode),
        ),
        forMember(
          (pd) => pd.purchasedDate,
          mapFrom((p) => p.purchasedDate?.getTime()),
        ),
        forMember(
          (p) => p.owners,
          mapFrom((pd) => {
            if (pd.owners) {
              return this.mapper.mapArray(
                pd.owners,
                ApplicationOwner,
                PublicOwnerDto,
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

      createMap(
        mapper,
        ApplicationSubmissionReview,
        PublicApplicationSubmissionReviewDto,
      );

      createMap(
        mapper,
        ApplicationDocument,
        PublicDocumentDto,
        forMember(
          (a) => a.mimeType,
          mapFrom((ad) => ad.document.mimeType),
        ),
        forMember(
          (a) => a.fileName,
          mapFrom((ad) => ad.document.fileName),
        ),
        forMember(
          (a) => a.fileSize,
          mapFrom((ad) => ad.document.fileSize),
        ),
        forMember(
          (a) => a.uploadedAt,
          mapFrom((ad) => ad.document.uploadedAt.getTime()),
        ),
        forMember(
          (a) => a.documentUuid,
          mapFrom((ad) => ad.document.uuid),
        ),
      );
    };
  }
}
