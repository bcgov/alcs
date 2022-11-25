import { ApplicationDocumentDto } from './application-document/application-document.dto';

export class ApplicationDto {
  fileNumber: string;
  createdAt: Date;
  applicant: string;
  localGovernmentUuid: string;
  documents: ApplicationDocumentDto[];
}
