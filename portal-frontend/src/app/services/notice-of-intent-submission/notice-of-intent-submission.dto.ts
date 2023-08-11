import { BaseCodeDto } from '../../shared/dto/base.dto';
import { NoticeOfIntentOwnerDto } from '../notice-of-intent-owner/notice-of-intent-owner.dto';

export enum NOI_SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //Received By ALC
  ALC_DECISION = 'ALCD', //Decision Released
  CANCELLED = 'CANC',
}

export interface NoticeOfIntentSubmissionStatusDto extends BaseCodeDto {
  code: NOI_SUBMISSION_STATUS;
  portalBackgroundColor: string;
  portalColor: string;
}

export interface NoticeOfIntentSubmissionToSubmissionStatusDto {
  submissionUuid: string;
  effectiveDate: number | null;
  statusTypeCode: string;
  status: NoticeOfIntentSubmissionStatusDto;
}

export interface NoticeOfIntentSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  type: string;
  status: NoticeOfIntentSubmissionStatusDto;
  submissionStatuses: NoticeOfIntentSubmissionToSubmissionStatusDto[];
  owners: NoticeOfIntentOwnerDto[];
  canEdit: boolean;
  canView: boolean;
}

export interface NoticeOfIntentSubmissionDetailedDto extends NoticeOfIntentSubmissionDto {
  purpose: string | null;
  parcelsAgricultureDescription: string;
  parcelsAgricultureImprovementDescription: string;
  parcelsNonAgricultureUseDescription: string;
  northLandUseType: string;
  northLandUseTypeDescription: string;
  eastLandUseType: string;
  eastLandUseTypeDescription: string;
  southLandUseType: string;
  southLandUseTypeDescription: string;
  westLandUseType: string;
  westLandUseTypeDescription: string;
  primaryContactOwnerUuid?: string | null;
}

export interface NoticeOfIntentSubmissionUpdateDto {
  applicant?: string;
  purpose?: string;
  localGovernmentUuid?: string;
  typeCode?: string;
  parcelsAgricultureDescription?: string;
  parcelsAgricultureImprovementDescription?: string;
  parcelsNonAgricultureUseDescription?: string;
  northLandUseType?: string;
  northLandUseTypeDescription?: string;
  eastLandUseType?: string;
  eastLandUseTypeDescription?: string;
  southLandUseType?: string;
  southLandUseTypeDescription?: string;
  westLandUseType?: string;
  westLandUseTypeDescription?: string;
}
