export const protobufPackage = 'alcs_application';

export interface ApplicationByNumberGrpc {
  fileNumber: string;
}

export interface ApplicationGrpc {
  fileNumber: string;
  applicant: string;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
  dateSubmittedToAlc: number;
  card?: CardGrpc | undefined;
}

export interface CardGrpc {
  type: string;
  uuid: string;
  highPriority?: boolean | undefined;
  createdAt: string;
}

export const ALCS_APPLICATION_PACKAGE_NAME = 'alcs_application';
