import { ApplicationStatusDto } from './application-status.dto';

export interface ApplicationDto {
  fileNumber: string;
  title: string;
  body: string;
  status: ApplicationStatusDto;
}

export interface ApplicationCreateDto {
  fileNumber: string;
  title: string;
  body: string;
  statusId?: string;
}
