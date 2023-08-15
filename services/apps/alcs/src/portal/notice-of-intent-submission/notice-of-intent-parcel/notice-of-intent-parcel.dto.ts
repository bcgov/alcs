import { AutoMap } from '@automapper/classes';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { NoticeOfIntentDocumentDto } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { NoticeOfIntentOwnerDto } from '../notice-of-intent-owner/notice-of-intent-owner.dto';

export class NoticeOfIntentParcelOwnershipTypeDto extends BaseCodeDto {}

export class NoticeOfIntentParcelDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicationSubmissionUuid: string;

  @AutoMap(() => String)
  certificateOfTitleUuid: string | null;

  @AutoMap(() => String)
  pid?: string | null;

  @AutoMap(() => String)
  pin?: string | null;

  @AutoMap(() => String)
  legalDescription?: string | null;

  @AutoMap(() => String)
  civicAddress?: string | null;

  @AutoMap(() => Number)
  mapAreaHectares?: number | null;

  @AutoMap(() => Number)
  purchasedDate?: number | null;

  @AutoMap(() => Boolean)
  isFarm?: boolean | null;

  @AutoMap(() => Boolean)
  isConfirmedByApplicant?: boolean;

  @AutoMap(() => String)
  ownershipTypeCode?: string | null;

  @AutoMap(() => String)
  crownLandOwnerType?: string | null;

  ownershipType?: NoticeOfIntentParcelOwnershipTypeDto;

  @AutoMap(() => String)
  parcelType: string;

  @AutoMap(() => Number)
  alrArea: number | null;

  certificateOfTitle?: NoticeOfIntentDocumentDto;
  owners: NoticeOfIntentOwnerDto[];
}

export class NoticeOfIntentParcelCreateDto {
  @IsNotEmpty()
  @IsString()
  noticeOfIntentSubmissionUuid: string;

  @IsOptional()
  @IsString()
  parcelType?: string;

  @IsOptional()
  @IsString()
  ownerUuid?: string;
}

export class NoticeOfIntentParcelUpdateDto {
  @IsString()
  uuid: string;

  @IsString()
  @IsOptional()
  pid?: string | null;

  @IsString()
  @IsOptional()
  pin?: string | null;

  @IsString()
  @IsOptional()
  civicAddress?: string | null;

  @IsString()
  @IsOptional()
  legalDescription?: string | null;

  @IsNumber()
  @IsOptional()
  mapAreaHectares?: number | null;

  @IsNumber()
  @IsOptional()
  purchasedDate?: number | null;

  @IsBoolean()
  @IsOptional()
  isFarm?: boolean | null;

  @IsBoolean()
  @IsOptional()
  isConfirmedByApplicant?: boolean;

  @IsString()
  @IsOptional()
  ownershipTypeCode?: string | null;

  @IsString()
  @IsOptional()
  crownLandOwnerType?: string | null;

  @IsArray()
  @IsOptional()
  ownerUuids?: string[] | null;

  @IsNumber()
  @IsOptional()
  alrArea?: number | null;
}

export class AttachCertificateOfTitleDto {
  @IsString()
  mimeType: string;

  @IsString()
  fileName: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  fileKey: string;
}
