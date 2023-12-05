import { AutoMap } from 'automapper-classes';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ParcelOwnershipTypeDto } from '../../../common/entities/parcel-ownership-type/parcel-ownership-type.entity';

export class NotificationParcelDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  notificationSubmissionUuid: string;

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

  @AutoMap(() => Boolean)
  isConfirmedByApplicant?: boolean;

  @AutoMap(() => Number)
  alrArea: number | null;

  ownershipType?: ParcelOwnershipTypeDto;

  @AutoMap(() => String)
  ownershipTypeCode?: string;
}

export class NotificationParcelCreateDto {
  @IsNotEmpty()
  @IsString()
  notificationSubmissionUuid: string;
}

export class NotificationParcelUpdateDto {
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

  @IsBoolean()
  @IsOptional()
  isConfirmedByApplicant?: boolean;

  @IsString()
  @IsOptional()
  ownershipTypeCode?: string | null;

  @IsString()
  @IsOptional()
  crownLandOwnerType?: string | null;
}
