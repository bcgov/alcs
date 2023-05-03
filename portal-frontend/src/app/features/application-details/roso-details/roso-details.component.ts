import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto, DOCUMENT_TYPE } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { PARCEL_TYPE } from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-roso-details[applicationSubmission]',
  templateUrl: './roso-details.component.html',
  styleUrls: ['./roso-details.component.scss'],
})
export class RosoDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;
  @Input() updatedFields: string[] = [];

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;
  totalTargetAcres: string | undefined;
  totalAcres: string | undefined;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDetailedDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
      this.loadParcels(applicationSubmission.fileNumber);

      this.totalAcres = applicationSubmission.subdProposedLots
        .reduce((total, lot) => total + (lot.size !== null ? lot.size : 0), 0)
        .toFixed(2);
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.reclamationPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
  }

  crossSections: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];
  reclamationPlans: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationParcelService: ApplicationParcelService
  ) {}

  onEditSection(step: number) {
    if (this.draftMode) {
      this.router.navigateByUrl(`/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    } else {
      this.router.navigateByUrl(`application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  private async loadParcels(fileNumber: string) {
    if (this._applicationSubmission) {
      const parcels = await this.applicationParcelService.fetchBySubmissionUuid(this._applicationSubmission?.uuid);
      if (parcels) {
        this.totalTargetAcres = parcels
          .filter((parcel) => parcel.parcelType === PARCEL_TYPE.APPLICATION)
          .reduce((total, parcel) => total + (parcel.mapAreaHectares ? parseFloat(parcel.mapAreaHectares) : 0), 0)
          .toFixed(2);
      }
    }
  }
}
