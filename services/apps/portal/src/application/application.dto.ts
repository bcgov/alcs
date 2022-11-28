import { AutoMap } from '@automapper/classes';
import { ApplicationDocumentDto } from './application-document/application-document.dto';

export class ApplicationDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  applicant: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  documents: ApplicationDocumentDto[];
}

export class CreateApplicationDto {
  applicant: string;
  localGovernmentUuid: string;
  documents: any[];
}
