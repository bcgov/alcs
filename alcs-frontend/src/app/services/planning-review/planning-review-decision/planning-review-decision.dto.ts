import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface UpdatePlanningReviewDecisionDto {
  resolutionNumber?: number;
  resolutionYear?: number;
  date?: number;
  outcomeCode?: string;
  decisionDescription?: string | null;
  isDraft?: boolean;
}

export interface CreatePlanningReviewDecisionDto {
  planningReviewFileNumber: string;
}

export interface PlanningReviewDecisionOutcomeCodeDto extends BaseCodeDto {}

export interface PlanningReviewDecisionDto {
  uuid: string;
  planningReviewFileNumber: string;
  date?: number;
  resolutionNumber: number;
  resolutionYear: number;
  documents: PlanningReviewDecisionDocumentDto[];
  isDraft: boolean;
  decisionDescription?: string | null;
  createdAt?: number | null;
  wasReleased: boolean;
  outcome?: PlanningReviewDecisionOutcomeCodeDto;
}

export interface PlanningReviewDecisionDocumentDto {
  uuid: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}
