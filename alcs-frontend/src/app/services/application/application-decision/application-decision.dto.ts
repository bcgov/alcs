import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface ApplicationDecisionDto extends CreateApplicationDecisionDto {
  uuid: string;
  documents: DecisionDocumentDto[];
}

export interface CreateApplicationDecisionDto {
  date: number;
  applicationFileNumber: string;
  outcome: string;
}

export interface UpdateApplicationDecisionDto {
  date: number;
  outcome: string;
}

export interface DecisionDocumentDto {
  uuid: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface ApplicationDecisionOutComeDto extends BaseCodeDto {}
