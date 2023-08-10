import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NoticeOfIntentDocumentDto } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import {
  NoticeOfIntentOwnerDetailedDto,
  NoticeOfIntentOwnerDto,
} from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcelDto } from '../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcel } from '../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { OwnerType, OwnerTypeDto } from '../owner-type/owner-type.entity';

@Injectable()
export class NoticeOfIntentOwnerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        NoticeOfIntentOwner,
        NoticeOfIntentOwnerDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) => `${p.firstName} ${p.lastName}`),
        ),
        forMember(
          (pd) => pd.corporateSummary,
          mapFrom((p) =>
            p.corporateSummary
              ? this.mapper.map(
                  p.corporateSummary,
                  NoticeOfIntentDocument,
                  NoticeOfIntentDocumentDto,
                )
              : undefined,
          ),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentOwner,
        NoticeOfIntentOwnerDetailedDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) => `${p.firstName} ${p.lastName}`),
        ),
        forMember(
          (ad) => ad.parcels,
          mapFrom((a) => {
            if (a.parcels) {
              return this.mapper.mapArray(
                a.parcels,
                NoticeOfIntentParcel,
                NoticeOfIntentParcelDto,
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
                  NoticeOfIntentDocument,
                  NoticeOfIntentDocumentDto,
                )
              : undefined,
          ),
        ),
      );

      createMap(mapper, OwnerType, OwnerTypeDto);
    };
  }
}
