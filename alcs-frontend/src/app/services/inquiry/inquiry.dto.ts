import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationRegionDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { CardDto } from '../card/card.dto';
import { InquiryParcelCreateDto, InquiryParcelDto } from './inquiry-parcel/inquiry-parcel.dto';

export interface InquiryTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}

export interface CreateInquiryDto {
  boardCode: string;
  summary: string;
  submittedToAlcDate: number;
  localGovernmentUuid: string;
  typeCode: string;
  regionCode: string;
  inquirerFirstName?: string;
  inquirerLastName?: string;
  inquirerOrganization?: string;
  inquirerPhone?: string;
  inquirerEmail?: string;
  parcels?: InquiryParcelCreateDto[];
}

export interface InquiryDto {
  uuid: string;
  fileNumber: string;
  summary: string;
  open: boolean;
  dateSubmittedToAlc: number;
  localGovernmentUuid: string;
  typeCode: string;
  regionCode: string;
  inquirerFirstName?: string;
  inquirerLastName?: string;
  inquirerOrganization?: string;
  inquirerPhone?: string;
  inquirerEmail?: string;
  parcels?: InquiryParcelDto[];
  localGovernment: ApplicationLocalGovernmentDto;
  region: ApplicationRegionDto;
  card?: CardDto;
  type: InquiryTypeDto;
}

export interface UpdateInquiryDto {
  summary?: string;
  open?: boolean;
  dateSubmittedToAlc?: number;
  typeCode?: string;
  inquirerFirstName?: string;
  inquirerLastName?: string;
  inquirerOrganization?: string;
  inquirerPhone?: string;
  inquirerEmail?: string;
  parcels?: InquiryParcelCreateDto[];
}
