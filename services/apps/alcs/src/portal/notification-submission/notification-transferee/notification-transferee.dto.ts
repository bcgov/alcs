import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString, Matches } from 'class-validator';
import { OwnerTypeDto } from '../../../common/owner-type/owner-type.entity';
import { emailRegex } from '../../../utils/email.helper';

export class NotificationTransfereeDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  notificationSubmissionUuid: string;

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
}

export class NotificationTransfereeUpdateDto {
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
}

export class NotificationTransfereeCreateDto extends NotificationTransfereeUpdateDto {
  @IsString()
  notificationSubmissionUuid: string;
}
