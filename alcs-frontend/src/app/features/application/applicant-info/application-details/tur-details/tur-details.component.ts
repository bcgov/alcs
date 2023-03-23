import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_TYPE,
} from '../../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';

@Component({
  selector: 'app-tur-details[application]',
  templateUrl: './tur-details.component.html',
  styleUrls: ['./tur-details.component.scss'],
})
export class TurDetailsComponent {
  _application: ApplicationSubmissionDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;

  @Input() set application(application: ApplicationSubmissionDto | undefined) {
    if (application) {
      this._application = application;
    }
  }

  @Input() set files(files: ApplicationDocumentDto[] | undefined) {
    if (files) {
      this.servingNotice = files.filter((file) => file.type === DOCUMENT_TYPE.SERVING_NOTICE);
      this.proposalMap = files.filter((file) => file.type === DOCUMENT_TYPE.PROPOSAL_MAP);
    }
  }

  servingNotice: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(private router: Router, private applicationDocumentService: ApplicationDocumentService) {}

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }
}
