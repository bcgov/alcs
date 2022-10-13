import { ApplicationReconsiderationDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../application/application.dto';

export interface BoardDto {
  code: string;
  title: string;
  decisionMaker: string;
  statuses: BoardStatusDto[];
}

export interface BoardStatusDto {
  order: number;
  label: string;
  statusCode: string;
}

export interface CardsDto {
  applications: ApplicationDto[];
  reconsiderations: ApplicationReconsiderationDto[];
}
