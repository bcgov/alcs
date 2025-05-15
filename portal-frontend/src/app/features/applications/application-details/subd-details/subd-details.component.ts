import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../shared/utils/file';
import { DocumentService } from '../../../../services/document/document.service';
import { ToastService } from '../../../../services/toast/toast.service';

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
        .toFixed(5);
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
    private documentService: DocumentService,
    private applicationParcelService: ApplicationParcelService,
    private toastService: ToastService,
  ) {}

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`,
      );
    } else {
      await this.router.navigateByUrl(`application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }

  private async loadParcels(fileNumber: string) {
    if (this._applicationSubmission) {
      const parcels = await this.applicationParcelService.fetchBySubmissionUuid(this._applicationSubmission?.uuid);
      if (parcels) {
        this.totalTargetAcres = parcels
          .reduce((total, parcel) => total + (parcel.mapAreaHectares ? parseFloat(parcel.mapAreaHectares) : 0), 0)
          .toFixed(5);
      }
    }
  }
}
