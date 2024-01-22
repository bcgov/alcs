import { ApplicationRegionDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { CardDto } from '../card/card.dto';

export interface CreatePlanningReviewDto {
  fileNumber: string;
  type: string;
  localGovernmentUuid: string;
  regionCode: string;
  boardCode: string;
}

export interface PlanningReviewDto {
  fileNumber: string;
  card: CardDto;
  localGovernment: ApplicationLocalGovernmentDto;
  region: ApplicationRegionDto;
  type: string;
}
