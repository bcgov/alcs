import { ApplicationStatusDto } from 'src/application-status/application-status.dto';

export class ApplicationDto {
  fileNumber: string;
  title: string;
  body: string;
  status: ApplicationStatusDto;
}

export class ApplicationCreateDto {
  fileNumber: string;
  title: string;
  body: string;
  statusId?: string;
}
