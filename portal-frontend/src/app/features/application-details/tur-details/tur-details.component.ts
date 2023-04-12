import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto, DOCUMENT_TYPE } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-tur-details[application]',
  templateUrl: './tur-details.component.html',
  styleUrls: ['./tur-details.component.scss'],
})
export class TurDetailsComponent {
  _application: ApplicationSubmissionDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;

  @Input() set application(application: ApplicationSubmissionDetailedDto | undefined) {
    if (application) {
      this._application = application;
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.servingNotice = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SERVING_NOTICE);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  servingNotice: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(private router: Router, private applicationDocumentService: ApplicationDocumentService) {}

  onEditSection(step: number) {
    this.router.navigateByUrl(`application/${this._application?.fileNumber}/edit/${step}?errors=t`);
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }
}
