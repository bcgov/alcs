import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { SUBMISSION_STATUS } from '../application.dto';

export interface ApplicationStatusDto extends BaseCodeDto {
  alcsBackgroundColor: string;

  alcsColor: string;

  portalBackgroundColor: string;

  portalColor: string;

  code: SUBMISSION_STATUS;

  weight: number;
}

export interface ApplicationSubmissionToSubmissionStatusDto {
  submissionUuid: string;

  effectiveDate: number | null;

  statusTypeCode: string;

  status: ApplicationStatusDto;
}
