import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto, DOCUMENT_TYPE } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { PARCEL_TYPE } from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-subd-details[application]',
  templateUrl: './subd-details.component.html',
  styleUrls: ['./subd-details.component.scss'],
})
export class SubdDetailsComponent {
  _application: ApplicationSubmissionDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;
  totalTargetAcres: string | undefined;
  totalAcres: string | undefined;

  @Input() set application(application: ApplicationSubmissionDetailedDto | undefined) {
    if (application) {
      this._application = application;
      this.loadParcels(application.fileNumber);

      this.totalAcres = application.subdProposedLots
        .reduce((total, lot) => total + (lot.size !== null ? lot.size : 0), 0)
        .toFixed(2);
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.homesiteDocuments = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.HOMESITE_SEVERANCE);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  homesiteDocuments: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationParcelService: ApplicationParcelService
  ) {}

  onEditSection(step: number) {
    this.router.navigateByUrl(`application/${this._application?.fileNumber}/edit/${step}?errors=t`);
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  private async loadParcels(fileNumber: string) {
    const parcels = await this.applicationParcelService.fetchByFileId(fileNumber);
    if (parcels) {
      this.totalTargetAcres = parcels
        .filter((parcel) => parcel.parcelType === PARCEL_TYPE.APPLICATION)
        .reduce((total, parcel) => total + (parcel.mapAreaHectares ? parseFloat(parcel.mapAreaHectares) : 0), 0)
        .toFixed(2);
    }
  }
}
