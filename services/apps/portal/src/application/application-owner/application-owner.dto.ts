import { AutoMap } from '@automapper/classes';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';

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

  @AutoMap()
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
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  typeCode: string;

  @IsUUID()
  @IsOptional()
  corporateSummaryUuid?: string;
}

export class ApplicationOwnerCreateDto extends ApplicationOwnerUpdateDto {
  @IsString()
  applicationFileId: string;

  @IsUUID()
  parcelUuid: string;
}
