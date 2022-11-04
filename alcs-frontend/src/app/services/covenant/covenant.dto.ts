import { ApplicationRegionDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { CardDto } from '../card/card.dto';

export interface CreateCovenantDto {
  fileNumber: string;
  localGovernmentUuid: string;
  regionCode: string;
  applicant: string;
}

export interface CovenantDto {
  fileNumber: string;
  card: CardDto;
  localGovernment: ApplicationLocalGovernmentDto;
  region: ApplicationRegionDto;
  applicant: string;
}
