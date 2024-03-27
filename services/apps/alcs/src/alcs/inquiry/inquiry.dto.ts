import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import {
  InquiryParcelCreateDto,
  InquiryParcelDto,
  InquiryParcelUpdateDto,
} from './inquiry-parcel/inquiry-parcel.dto';

export class InquiryTypeDto extends BaseCodeDto {
  @AutoMap()
  shortLabel: string;

  @AutoMap()
  backgroundColor: string;

  @AutoMap()
  textColor: string;
}

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty()
  boardCode: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsNumber()
  @IsNotEmpty()
  submittedToAlcDate: number;

  @IsString()
  @IsNotEmpty()
  localGovernmentUuid: string;

  @IsString()
  @IsNotEmpty()
  typeCode: string;

  @IsString()
  @IsNotEmpty()
  regionCode: string;

  @IsString()
  @IsOptional()
  inquirerFirstName?: string;

  @IsString()
  @IsOptional()
  inquirerLastName?: string;

  @IsString()
  @IsOptional()
  inquirerOrganization?: string;

  @IsString()
  @IsOptional()
  inquirerPhone?: string;

  @IsString()
  @IsOptional()
  inquirerEmail?: string;

  @IsOptional()
  @Type(() => InquiryParcelCreateDto)
  parcels?: InquiryParcelCreateDto[];
}

export class InquiryDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  open: boolean;

  @AutoMap()
  fileNumber: string;

  @AutoMap()
  summary: string;

  @AutoMap()
  dateSubmittedToAlc: number;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  typeCode: string;

  @AutoMap()
  regionCode: string;

  @AutoMap()
  inquirerFirstName?: string;

  @AutoMap()
  inquirerLastName?: string;

  @AutoMap()
  inquirerOrganization?: string;

  @AutoMap()
  inquirerPhone?: string;

  @AutoMap()
  inquirerEmail?: string;

  @Type(() => InquiryParcelDto)
  parcels?: InquiryParcelDto[];

  @AutoMap(() => LocalGovernmentDto)
  localGovernment: LocalGovernmentDto;

  @AutoMap(() => ApplicationRegionDto)
  region: ApplicationRegionDto;

  @AutoMap(() => CardDto)
  card?: CardDto;

  @AutoMap(() => InquiryTypeDto)
  type: InquiryTypeDto;
}

export class UpdateInquiryDto {
  @IsString()
  @IsOptional()
  summary?: string;

  @IsBoolean()
  @IsOptional()
  open?: boolean;

  @IsNumber()
  @IsOptional()
  dateSubmittedToAlc?: number;

  @IsString()
  @IsOptional()
  typeCode?: string;

  @IsString()
  @IsOptional()
  inquirerFirstName?: string;

  @IsString()
  @IsOptional()
  inquirerLastName?: string;

  @IsString()
  @IsOptional()
  inquirerOrganization?: string;

  @IsString()
  @IsOptional()
  inquirerPhone?: string;

  @IsString()
  @IsOptional()
  inquirerEmail?: string;

  @IsOptional()
  @Type(() => InquiryParcelUpdateDto)
  parcels?: InquiryParcelUpdateDto[];
}

export class CreateInquiryServiceDto {
  summary: string;
  dateSubmittedToAlc: Date;
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
