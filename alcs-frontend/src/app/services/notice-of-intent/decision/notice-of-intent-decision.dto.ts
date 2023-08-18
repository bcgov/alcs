import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { NoticeOfIntentModificationDto } from '../notice-of-intent-modification/notice-of-intent-modification.dto';

export interface UpdateNoticeOfIntentDecisionDto {
  date?: number;
  outcomeCode?: string;
  auditDate?: number | null;
  decisionMaker?: string | null;
  decisionMakerName?: string | null;
}

export interface CreateNoticeOfIntentDecisionDto extends UpdateNoticeOfIntentDecisionDto {
  date: number;
  outcomeCode: string;
  resolutionNumber: number;
  resolutionYear: number;
  applicationFileNumber: string;
  decisionMaker: string;
  decisionMakerName?: string;
  auditDate?: number | null;
  modifiesUuid?: string;
}

export interface LinkedResolutionDto {
  uuid: string;
  linkedResolutions: string[];
}

export interface NoticeOfIntentDecisionDto {
  uuid: string;
  date: number;
  outcome: NoticeOfIntentDecisionOutcomeCodeDto;
  resolutionNumber: number;
  resolutionYear: number;
  auditDate?: number | null;
  decisionMaker: string;
  decisionMakerName?: string;
  noticeOfIntentFileNumber: string;
  documents: NoticeOfIntentDecisionDocumentDto[];
  modifies?: LinkedResolutionDto;
  modifiedBy?: LinkedResolutionDto[];
}

export interface NoticeOfIntentDecisionDocumentDto {
  uuid: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface NoticeOfIntentDecisionOutcomeCodeDto extends BaseCodeDto {}
