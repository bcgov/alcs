import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApplicationParcelDocumentDto } from './application-parcel-document/application-parcel-document.dto';

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

  @AutoMap()
  documents: ApplicationParcelDocumentDto[];
}

export class ApplicationParcelCreateDto {
  @IsNotEmpty()
  @IsString()
  applicationFileId: string;
}

export class ApplicationParcelUpdateDto {
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
}
