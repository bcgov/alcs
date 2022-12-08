import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export const protobufPackage = 'alcs_application';

export interface ApplicationByNumberGrpc {
  fileNumber: string;
}

export class ApplicationGrpc {
  @AutoMap()
  fileNumber: string;
  @AutoMap()
  applicant: string;
  @AutoMap()
  dateSubmittedToAlc: string;
  @AutoMap()
  regionCode: string;
  @AutoMap()
  localGovernmentUuid: string;
  @AutoMap()
  typeCode: string;
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
  localGovernmentUuid: string;
}

export const ALCS_APPLICATION_PACKAGE_NAME = 'alcs_application';
