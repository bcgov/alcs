import { AutoMap } from '@automapper/classes';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { NoticeOfIntentDocumentDto } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';
import {
  OwnerTypeDto,
  OWNER_TYPE,
} from '../../../common/owner-type/owner-type.entity';
import { emailRegex } from '../../../utils/email.helper';
import { NoticeOfIntentParcelDto } from '../notice-of-intent-parcel/notice-of-intent-parcel.dto';

export class NoticeOfIntentOwnerDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  noticeOfIntentSubmissionUuid: string;

  @AutoMap(() => String)
  corporateSummaryUuid?: string;

  displayName: string;

  @AutoMap(() => String)
  firstName?: string | null;

  @AutoMap(() => String)
  lastName?: string | null;

  @AutoMap(() => String)
  organizationName?: string | null;

  @AutoMap(() => String)
  phoneNumber?: string | null;

  @AutoMap(() => String)
  email?: string | null;

  @AutoMap()
  type: OwnerTypeDto;

  @AutoMap(() => NoticeOfIntentDocumentDto)
  corporateSummary?: NoticeOfIntentDocumentDto;
}

export class NoticeOfIntentOwnerDetailedDto extends NoticeOfIntentOwnerDto {
  parcels: NoticeOfIntentParcelDto[];
}

export class NoticeOfIntentOwnerUpdateDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  organizationName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @Matches(emailRegex)
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  typeCode?: string;

  @IsUUID()
  @IsOptional()
  corporateSummaryUuid?: string;
}

export class NoticeOfIntentOwnerCreateDto extends NoticeOfIntentOwnerUpdateDto {
  @IsString()
  noticeOfIntentSubmissionUuid: string;
}

export class SetPrimaryContactDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  type?: OWNER_TYPE;

  @IsUUID()
  @IsOptional()
  ownerUuid?: string;

  @IsString()
  noticeOfIntentSubmissionUuid: string;
}

export class AttachCorporateSummaryDto {
  @IsString()
  mimeType: string;

  @IsString()
  fileName: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  fileKey: string;

  @IsString()
  fileNumber: string;
}
