import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { emailRegex } from '../../../utils/email.helper';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';

export enum APPLICATION_OWNER {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
  AGENT = 'AGEN',
  CROWN = 'CRWN',
}

export class ApplicationOwnerTypeDto extends BaseCodeDto {}

export class ApplicationOwnerDto {
  @AutoMap()
  uuid: string;

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
  type: ApplicationOwnerTypeDto;

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
  typeCode: string;

  @IsUUID()
  @IsOptional()
  corporateSummaryUuid?: string;
}

export class ApplicationOwnerCreateDto extends ApplicationOwnerUpdateDto {
  @IsString()
  applicationFileNumber: string;
}

export class SetPrimaryContactDto {
  @IsString()
  @IsOptional()
  agentFirstName?: string;

  @IsString()
  @IsOptional()
  agentLastName?: string;

  @IsString()
  @IsOptional()
  agentOrganization?: string;

  @IsString()
  @IsOptional()
  agentPhoneNumber?: string;

  @IsString()
  @IsOptional()
  agentEmail?: string;

  @IsUUID()
  @IsOptional()
  ownerUuid?: string;

  @IsString()
  fileNumber: string;
}
