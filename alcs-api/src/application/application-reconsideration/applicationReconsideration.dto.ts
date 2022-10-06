import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';

export class ReconsiderationTypeDto extends BaseCodeDto {}

export class ApplicationReconsiderationCreateDto {
  @AutoMap()
  @IsNumber()
  submittedDate: number;

  @AutoMap()
  @IsString()
  typeCode: string;

  @AutoMap()
  @IsOptional()
  applicationUuid?: string;

  @IsString()
  localGovernmentUuid: string;

  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  applicationType: string;

  @IsNotEmpty()
  @IsString()
  region: string;
}

export class ApplicationReconsiderationUpdateDto {
  @AutoMap()
  @IsNumber()
  submittedDate: number;

  @AutoMap()
  @IsString()
  typeCode: string;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  reviewDate?: number;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isReviewApproved?: boolean;
}

// export class ApplicationReconsiderationCreateServiceDto {
//   @AutoMap()
//   @IsNumber()
//   submittedDate: number;

//   @AutoMap()
//   @IsString()
//   typeUuid: string;

//   @AutoMap()
//   @IsOptional()
//   applicationUuid?: string;

//   @IsNotEmpty()
//   @IsString()
//   fileNumber?: string;

//   @IsNotEmpty()
//   @IsString()
//   applicant?: string;

//   @IsString()
//   type?: string;

//   @IsString()
//   @IsOptional()
//   region?: string;

//   @IsNotEmpty()
//   @IsString()
//   localGovernmentUuid;
// }
