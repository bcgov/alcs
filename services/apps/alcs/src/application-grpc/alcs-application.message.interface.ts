import { IsString } from 'class-validator';

export const protobufPackage = 'alcs_application';

export interface ApplicationByNumberGrpc {
  fileNumber: string;
}

export class ApplicationGrpc {
  fileNumber: string;
  applicant: string;
  dateSubmittedToAlc: string;
  regionCode: string;
  localGovernmentUuid: string;
}

export class ApplicationCreateGrpc {
  @IsString()
  fileNumber: string;

  @IsString()
  applicant: string;

  @IsString()
  typeCode: string;

  @IsString()
  dateSubmittedToAlc: string;

  @IsString()
  regionCode: string;

  @IsString()
  localGovernmentUuid: string;
}

export const ALCS_APPLICATION_PACKAGE_NAME = 'alcs_application';
