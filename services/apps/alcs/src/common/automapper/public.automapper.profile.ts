import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { ApplicationSubmissionReview } from '../../portal/application-submission-review/application-submission-review.entity';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import {
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
  PublicDocumentDto,
  PublicOwnerDto,
  PublicParcelDto,
} from '../../portal/public/application/public-application.dto';
import { PublicNoticeOfIntentSubmissionDto } from '../../portal/public/notice-of-intent/public-notice-of-intent.dto';
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
        NoticeOfIntentSubmission,
        PublicNoticeOfIntentSubmissionDto,
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
        NoticeOfIntentOwner,
        PublicOwnerDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) => `${p.firstName} ${p.lastName}`),
        ),
      );

      createMap(
        mapper,
        ApplicationParcel,
        PublicParcelDto,
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
        NoticeOfIntentParcel,
        PublicParcelDto,
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
                NoticeOfIntentOwner,
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

      createMap(
        mapper,
        NoticeOfIntentDocument,
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
