import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface ApplicationStatusDto extends BaseCodeDto {
  alcsBackgroundColor: string;

  alcsColor: string;

  portalBackgroundColor: string;

  portalColor: string;
}

export interface ApplicationSubmissionToSubmissionStatusDto {
  submissionUuid: string;

  effectiveDate: number;

  statusTypeCode: string;

  status: ApplicationStatusDto;
}
