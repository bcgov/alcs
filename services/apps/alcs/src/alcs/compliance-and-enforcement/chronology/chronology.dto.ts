import { AutoMap } from 'automapper-classes';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserDto } from '../../../user/user.dto';
import { ComplianceAndEnforcementDocumentDto } from '../document/document.dto';
import { InspectionDto } from './inspection/inspection.dto';

export class ComplianceAndEnforcementChronologyEntryDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  isDraft: boolean;

  @AutoMap()
  date: number | null;

  @AutoMap()
  author: UserDto;

  @AutoMap()
  description: string;

  @AutoMap()
  fileUuid: string;

  @AutoMap()
  documents: ComplianceAndEnforcementDocumentDto[];

  @AutoMap()
  inspections: InspectionDto[];
}

export class UpdateComplianceAndEnforcementChronologyEntryDto {
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsNumber()
  date?: number | null;

  @IsOptional()
  @IsString()
  authorUuid?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fileUuid?: string;
}
