import { AutoMap } from '@automapper/classes';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';

export class UpdateApplicationDecisionDto {
  @AutoMap()
  @IsNumber()
  @IsOptional()
  date: number;

  @AutoMap()
  @IsString()
  @IsOptional()
  outcome?: string;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  auditDate?: number | null;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  chairReviewRequired?: boolean;

  @AutoMap()
  @IsOptional()
  @IsNumber()
  @IsOptional()
  chairReviewDate?: number | null;
}

export class CreateApplicationDecisionDto {
  @AutoMap()
  @IsString()
  applicationFileNumber;

  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  outcome: string;

  @AutoMap()
  @IsBoolean()
  chairReviewRequired: boolean;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  auditDate?: number | null;

  @AutoMap()
  @IsOptional()
  @IsNumber()
  @IsOptional()
  chairReviewDate?: number | null;
}

export class ApplicationDecisionDto extends CreateApplicationDecisionDto {
  @AutoMap()
  @IsString()
  uuid: string;

  @AutoMap()
  documents: DecisionDocumentDto[];
}

export class DecisionDocumentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: string;

  @AutoMap()
  uploadedAt: number;
}

export class ApplicationDecisionOutcomeTypeDto extends BaseCodeDto {}
