import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application-local-government/application-local-government.dto';

export interface ReconsiderationTypeDto extends BaseCodeDto {
  backgroundColor: string;
  textColor: string;
}
export interface ApplicationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  applicant: string;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
}

export interface ApplicationReconsiderationDto {
  uuid: string;
  application: ApplicationDto;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: Date;
}

export interface ApplicationReconsiderationDetailedDto {}

export interface CreateApplicationReconsiderationDto {
  applicationTypeCode: string;
  applicationFileNumber: string;
  applicant: string;
  region: string;
  localGovernmentUuid: string;
  submittedDate: Date;
  reconTypeCode: string;
  boardCode: string;
}

export interface UpdateApplicationReconsiderationDto {
  submittedDate: Date;
  typeCode: string;
  reviewDate?: Date;
  isReviewApproved?: boolean;
  applicationFileNumber: string;
}
