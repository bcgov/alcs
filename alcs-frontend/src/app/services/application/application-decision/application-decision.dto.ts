import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface UpdateApplicationDecisionDto {
  date?: number;
  outcome?: string;
  chairReviewRequired?: boolean;
  auditDate?: number | null;
  chairReviewDate?: number | null;
}

export interface CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  date: number;
  outcome: string;
  chairReviewRequired: boolean;
  applicationFileNumber: string;
}

export interface ApplicationDecisionDto extends CreateApplicationDecisionDto {
  uuid: string;
  documents: DecisionDocumentDto[];
}

export interface DecisionDocumentDto {
  uuid: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface ApplicationDecisionOutcomeTypeDto extends BaseCodeDto {}
