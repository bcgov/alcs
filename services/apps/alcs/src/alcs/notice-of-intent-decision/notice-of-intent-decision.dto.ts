import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';

export class NoticeOfIntentDecisionOutcomeDto extends BaseCodeDto {
  @AutoMap()
  isFirstDecision: boolean;
}

export class UpdateNoticeOfIntentDecisionDto {
  @IsNumber()
  @IsOptional()
  resolutionNumber?: number;

  @IsNumber()
  @IsOptional()
  resolutionYear?: number;

  @IsNumber()
  @IsOptional()
  date?: number;

  @IsNumber()
  @IsOptional()
  auditDate?: number | null;

  @IsString()
  @IsOptional()
  outcomeCode?: string;

  @IsString()
  @IsOptional()
  decisionMaker?: string | null;

  @IsString()
  @IsOptional()
  decisionMakerName?: string | null;
}

export class CreateNoticeOfIntentDecisionDto extends UpdateNoticeOfIntentDecisionDto {
  @IsString()
  applicationFileNumber;

  @IsNumber()
  date: number;

  @IsString()
  outcomeCode: string;

  @IsNumber()
  resolutionNumber: number;

  @IsNumber()
  resolutionYear: number;
}

export class NoticeOfIntentDecisionDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicationFileNumber: string;

  @AutoMap()
  date: number;

  @AutoMap()
  auditDate: number;

  @AutoMap()
  resolutionNumber: string;

  @AutoMap()
  resolutionYear: number;

  @AutoMap(() => [NoticeOfIntentDecisionDocumentDto])
  documents: NoticeOfIntentDecisionDocumentDto[];

  @AutoMap(() => String)
  decisionMaker?: string | null;

  @AutoMap(() => String)
  decisionMakerName?: string | null;

  @AutoMap(() => NoticeOfIntentDecisionOutcomeDto)
  outcome?: NoticeOfIntentDecisionOutcomeDto | null;
}

export class NoticeOfIntentDecisionDocumentDto {
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
