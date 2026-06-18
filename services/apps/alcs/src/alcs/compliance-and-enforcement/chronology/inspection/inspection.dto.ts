import { AutoMap } from 'automapper-classes';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { UserDto } from '../../../../user/user.dto';
import { AllegedActivity, InspectionType } from '../../compliance-and-enforcement.enum';
import { ComplianceAndEnforcementDocumentDto } from '../../document/document.dto';

export class AttendeeDto {
  @AutoMap()
  name!: string;

  @AutoMap()
  organization!: string;
}

export class UpdateAttendeeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  organization?: string;
}

export class InspectionDto {
  @AutoMap()
  uuid!: string;

  @AutoMap()
  createdAt!: number;

  @AutoMap()
  isDraft!: boolean;

  @AutoMap()
  date!: string | null;

  @AutoMap()
  type!: InspectionType | null;

  @AutoMap()
  officer!: UserDto;

  @AutoMap()
  allegedActivity!: AllegedActivity[];

  @AutoMap()
  attendees!: AttendeeDto[];

  @AutoMap()
  comments!: string;

  @AutoMap()
  documents!: ComplianceAndEnforcementDocumentDto[];

  @AutoMap()
  entryUuid!: string;
}

export class UpdateInspectionDto {
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsDateString()
  date?: string | null;

  @IsOptional()
  @IsString()
  type?: InspectionType | null;

  @IsOptional()
  @IsString()
  officerUuid?: string;

  @IsOptional()
  @AutoMap()
  allegedActivity?: AllegedActivity[];

  @IsOptional()
  @AutoMap()
  attendees?: AttendeeDto[];

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  entryUuid?: string;
}
