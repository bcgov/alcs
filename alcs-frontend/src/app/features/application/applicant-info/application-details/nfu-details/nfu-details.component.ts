import { Component, Input } from '@angular/core';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-nfu-details[applicationSubmission]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() applicationSubmission!: ApplicationSubmissionDto;

  @Input() set files(documents: ApplicationDocumentDto[] | undefined) {
    if (documents) {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    }
  }

  proposalMap: ApplicationDocumentDto[] = [];

  constructor(private applicationDocumentService: ApplicationDocumentService) {}

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }
}
