import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface ApplicationStatusDto extends BaseCodeDto {}

export interface ApplicationDto {
  fileNumber: string;
  createdAt: Date;
  applicant: string;
  localGovernmentUuid: string;
  documents: any[];
  status: ApplicationStatusDto[];
}

export interface UpdateApplicationDto {
  applicant?: string;
  localGovernmentUuid?: string;
}
