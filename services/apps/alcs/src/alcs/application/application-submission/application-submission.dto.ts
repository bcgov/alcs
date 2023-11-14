import { IsArray, IsOptional, IsString } from 'class-validator';
import { ProposedLot } from '../../../portal/application-submission/application-submission.entity';

export class AlcsApplicationSubmissionUpdateDto {
  @IsArray()
  @IsOptional()
  subProposedLots?: ProposedLot[];

  @IsString()
  @IsOptional()
  returnComment?: string;
}
