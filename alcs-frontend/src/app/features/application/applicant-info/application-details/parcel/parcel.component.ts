import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../../services/application/application-parcel/application-parcel.service';
import { ApplicationSubmissionDto, PARCEL_OWNERSHIP_TYPE } from '../../../../../services/application/application.dto';

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent implements OnInit, OnChanges {
  @Input() application!: ApplicationSubmissionDto;
  @Input() files: ApplicationDocumentDto[] = [];
  @Input() parcelType!: string;

  pageTitle: string = 'Application Parcels';
  showCertificateOfTitle: boolean = true;

  fileId: string = '';
  parcels: any[] = [];

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private parcelService: ApplicationParcelService
  ) {}

  ngOnInit(): void {
    if (this.parcelType === 'other') {
      this.pageTitle = 'Other Parcels in the Community';
      this.showCertificateOfTitle = false;
    }
  }

  async onOpenFile(uuid: string) {
    const file = this.files.find((file) => file.uuid === uuid);
    if (file) {
      await this.applicationDocumentService.download(file.uuid, file.fileName);
    }
  }

  async loadParcels(fileNumber: string) {
    const parcels = await this.parcelService.fetchParcels(fileNumber);
    this.parcels = parcels.filter((e) => e.parcelType === this.parcelType);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadParcels(this.application.fileNumber);
  }
}
