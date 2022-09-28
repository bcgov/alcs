import { ApplicationDto } from '../application/application.dto';
import { ReconsiderationDto } from '../card/card-code.dto';

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
  reconsiderations: ReconsiderationDto[];
}
