import { AutoMap } from '@automapper/classes';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';

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
}

export class ApplicationOwnerCreateDto extends ApplicationOwnerUpdateDto {
  @IsString()
  applicationFileId: string;

  @IsUUID()
  parcelUuid: string;
}
