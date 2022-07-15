import { ApplicationStatusDto } from 'src/application-status/application-status.dto';

export class ApplicationDto {
  number: string;
  title: string;
  body: string;
  status: ApplicationStatusDto;
}

export class ApplicationCreateDto {
  number: string;
  title: string;
  body: string;
  statusId?: string;
}
