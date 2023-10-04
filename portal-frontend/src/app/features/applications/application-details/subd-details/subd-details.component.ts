import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { PARCEL_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';

@Component({
  selector: 'app-subd-details[applicationSubmission]',
  templateUrl: './subd-details.component.html',
  styleUrls: ['./subd-details.component.scss'],
})
export class SubdDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

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

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
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
