import { AutoMap } from '@automapper/classes';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { ApplicationStatusDto } from './application-status/application-status.dto';

export class ApplicationDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  createdAt: number;

  @AutoMap()
  updatedAt: number;

  @AutoMap()
  applicant: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  documents: ApplicationDocumentDto[];

  @AutoMap()
  status: ApplicationStatusDto;
}

export class UpdateApplicationDto {
  applicant: string;
  localGovernmentUuid: string;
  documents: any[];
}
