import { AutoMap } from '@automapper/classes';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { ApplicationOwnerDetailedDto } from '../application-owner/application-owner.dto';
import { ApplicationParcelDocumentDto } from './application-parcel-document/application-parcel-document.dto';

export class ApplicationParcelOwnershipTypeDto extends BaseCodeDto {}

export class ApplicationParcelDto {
  @AutoMap()
  uuid: string;

  @AutoMap(() => String)
  pid?: string | null;

  @AutoMap(() => String)
  pin?: string | null;

  @AutoMap(() => String)
  legalDescription?: string | null;

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

  ownershipType?: ApplicationParcelOwnershipTypeDto;

  @AutoMap(() => String)
  parcelType: string;

  documents: ApplicationParcelDocumentDto[];
  owners: ApplicationOwnerDetailedDto[];
}

export class ApplicationParcelCreateDto {
  @IsNotEmpty()
  @IsString()
  applicationFileId: string;

  @IsOptional()
  @IsString()
  parcelType?: string;

  @IsOptional()
  @IsString()
  ownerUuid?: string;
}

export class ApplicationParcelUpdateDto {
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
  isConfirmedByApplicant: boolean;

  @IsString()
  @IsOptional()
  ownershipTypeCode?: string | null;

  @IsString()
  @IsOptional()
  crownLandOwnerType?: string | null;

  @IsArray()
  ownerUuids: string[] | null;
}

export enum PARCEL_TYPE {
  APPLICATION = 'application',
  OTHER = 'other',
}
