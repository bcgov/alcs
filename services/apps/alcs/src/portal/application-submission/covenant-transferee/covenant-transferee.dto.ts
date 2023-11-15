import { AutoMap } from 'automapper-classes';
import { IsOptional, IsString, Matches } from 'class-validator';
import { OwnerTypeDto } from '../../../common/owner-type/owner-type.entity';
import { emailRegex } from '../../../utils/email.helper';

export class CovenantTransfereeDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicationSubmissionUuid: string;

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

export class CovenantTransfereeUpdateDto {
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

export class CovenantTransfereeCreateDto extends CovenantTransfereeUpdateDto {
  @IsString()
  applicationSubmissionUuid: string;
}
