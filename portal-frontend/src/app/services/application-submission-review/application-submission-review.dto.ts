export interface ApplicationSubmissionReviewDto {
  applicationFileNumber: string;
  localGovernmentFileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  department: string | null;
  phoneNumber: string | null;
  email: string | null;
  isOCPDesignation: boolean | null;
  OCPBylawName: string | null;
  OCPDesignation: string | null;
  OCPConsistent: boolean | null;
  isSubjectToZoning: boolean | null;
  zoningBylawName: string | null;
  zoningDesignation: string | null;
  zoningMinimumLotSize: string | null;
  isZoningConsistent: boolean | null;
  isAuthorized: boolean | null;
  isFirstNationGovernment: boolean;
}

export interface UpdateApplicationSubmissionReviewDto {
  localGovernmentFileNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  department?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isOCPDesignation?: boolean | null;
  OCPBylawName?: string | null;
  OCPDesignation?: string | null;
  OCPConsistent?: boolean | null;
  isSubjectToZoning?: boolean | null;
  zoningBylawName?: string | null;
  zoningDesignation?: string | null;
  zoningMinimumLotSize?: string | null;
  isZoningConsistent?: boolean | null;
  isAuthorized?: boolean | null;
}

export interface ReturnApplicationSubmissionDto {
  reasonForReturn: 'incomplete' | 'wrongGovernment';
  applicantComment: string;
}
