import { AutoMap } from '@automapper/classes';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import {
  OWNER_TYPE,
  OwnerTypeDto,
} from '../../../common/owner-type/owner-type.entity';
import { emailRegex } from '../../../utils/email.helper';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';

export class ApplicationOwnerDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicationSubmissionUuid: string;

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

  @AutoMap(() => ApplicationDocumentDto)
  corporateSummary?: ApplicationDocumentDto;
}

export class ApplicationOwnerDetailedDto extends ApplicationOwnerDto {
  parcels: ApplicationParcelDto[];
}

export class ApplicationOwnerUpdateDto {
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

export class ApplicationOwnerCreateDto extends ApplicationOwnerUpdateDto {
  @IsString()
  applicationSubmissionUuid: string;
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
  applicationSubmissionUuid: string;
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
