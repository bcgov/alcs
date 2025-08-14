import { AutoMap } from 'automapper-classes';
import { IsOptional, IsString } from 'class-validator';
import { ComplianceAndEnforcementDto } from '../compliance-and-enforcement.dto';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DocumentTypeDto } from '../../../document/document.dto';
import { DocumentDto } from '../../../document/document.dto';

export class ComplianceAndEnforcementDocumentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  type: DocumentTypeDto;

  @AutoMap()
  file: ComplianceAndEnforcementDto;

  @AutoMap()
  document: DocumentDto;

  @AutoMap()
  documentUuid: string;

  @AutoMap()
  source: DOCUMENT_SOURCE;

  @AutoMap()
  system: DOCUMENT_SYSTEM;

  @AutoMap()
  fileName: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedAt: number;

  @AutoMap()
  fileSize?: number;
}

export class UpdateComplianceAndEnforcementDocumentDto {
  @IsOptional()
  @IsString()
  @AutoMap()
  typeCode?: string;

  @IsOptional()
  @IsString()
  @AutoMap()
  fileName?: string;

  @IsOptional()
  @AutoMap()
  source?: DOCUMENT_SOURCE;

  @IsOptional()
  @IsString()
  @AutoMap()
  parcelUuid?: string;

  @IsOptional()
  @IsString()
  @AutoMap()
  ownerUuid?: string;
}
