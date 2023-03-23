import { Component, Input, OnInit } from '@angular/core';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionService } from '../../../../../services/application/application-submission/application-submission.service';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent implements OnInit {
  @Input() application!: ApplicationSubmissionDto;
  @Input() files: ApplicationDocumentDto[] = [];
  @Input() parcelType!: string;

  pageTitle: string = 'Application Parcels';
  showCertificateOfTitle: boolean = true;

  fileId: string = '';
  parcels: any[] = [];

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private applicationSubmissionService: ApplicationSubmissionService
  ) {}

  ngOnInit(): void {
    this.parcels = this.application.parcels
      .filter((e) => e.parcelType === this.parcelType)
      .map((parcel) => {
        return {
          ...parcel,
          owners: parcel.owners.map((owner) => ({
            ...owner,
            corporateSummary: this.files.find((file) => file.documentUuid === owner.corporateSummaryDocumentUuid),
          })),
        };
      });

    if (this.parcelType === 'other') {
      this.pageTitle = 'Other Parcels in the Community';
      this.showCertificateOfTitle = false;
    }
  }

  async onOpenFile(uuid: string) {
    const file = this.files.find((file) => file.uuid === uuid);
    if (file) {
      await this.applicationDocumentService.download(file.uuid, file.fileName);
    } else {
      const parcelFiles = this.application.parcels.flatMap((e) => e.documents);
      const parcelFile = parcelFiles.find((e) => e.documentUuid === uuid);
      if (parcelFile) {
        await this.applicationSubmissionService.downloadFile(parcelFile.documentUuid, parcelFile.fileName);
      }
    }
  }
}
