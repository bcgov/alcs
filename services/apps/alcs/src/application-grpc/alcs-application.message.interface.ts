import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export const ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME = 'alcs_application';

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
