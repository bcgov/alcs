import { ApplicationStatusDto } from './application-status.dto';

export interface ApplicationDto {
  number: string;
  title: string;
  body: string;
  status: ApplicationStatusDto;
}

export interface ApplicationCreateDto {
  number: string;
  title: string;
  body: string;
  statusId?: string;
}
