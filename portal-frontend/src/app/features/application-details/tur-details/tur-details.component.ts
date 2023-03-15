import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto, DOCUMENT } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';

@Component({
  selector: 'app-tur-details[application]',
  templateUrl: './tur-details.component.html',
  styleUrls: ['./tur-details.component.scss'],
})
export class TurDetailsComponent {
  _application: ApplicationDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;

  @Input() set application(application: ApplicationDetailedDto | undefined) {
    if (application) {
      this._application = application;
      this.servingNotice = application.documents.filter((document) => document.type === DOCUMENT.SERVING_NOTICE);
      this.proposalMap = application.documents.filter((document) => document.type === DOCUMENT.PROPOSAL_MAP);
    }
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
