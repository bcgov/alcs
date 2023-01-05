import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface LocalGovernmentDto {
  uuid: string;
  name: string;
}

export interface ApplicationTypeDto {
  code: string;
  portalLabel: string;
  htmlDescription: string;
}

export interface SubmissionTypeDto extends BaseCodeDto {
  htmlDescription: string;
}
