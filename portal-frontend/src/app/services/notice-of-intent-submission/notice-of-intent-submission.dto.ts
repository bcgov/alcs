export interface NoticeOfIntentSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  type: string;
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
