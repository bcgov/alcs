import { IsArray, IsOptional } from 'class-validator';
import { ProposedLot } from '../../../portal/application-submission/application-submission.entity';

export class AlcsApplicationSubmissionUpdateDto {
  @IsArray()
  @IsOptional()
  subProposedLots?: ProposedLot[];
}
