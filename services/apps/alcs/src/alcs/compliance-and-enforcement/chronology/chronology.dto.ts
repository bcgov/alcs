import { AutoMap } from 'automapper-classes';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';
import { ComplianceAndEnforcementDocumentDto } from '../document/document.dto';

export class ComplianceAndEnforcementChronologyEntryDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  isDraft: boolean;

  @AutoMap()
  date: number | null;

  @AutoMap()
  description: string;

  @AutoMap()
  fileUuid: string;

  @AutoMap()
  documents: ComplianceAndEnforcementDocumentDto[];
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
  description?: string;

  @IsOptional()
  @IsString()
  fileUuid?: string;
}
