import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';

export class CreateApplicationDecisionDto {
  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  applicationFileNumber;

  @AutoMap()
  @IsString()
  outcome: string;
}

export class UpdateApplicationDecisionDto {
  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  outcome: string;
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

export class ApplicationDecisionOutcomeDto extends BaseCodeDto {}
