import { AfterContentChecked, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../../services/application/application-parcel/application-parcel.service';
import { ApplicationSubmissionDto, PARCEL_OWNERSHIP_TYPE } from '../../../../../services/application/application.dto';

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent implements OnInit, OnChanges, OnDestroy, AfterContentChecked {
  $destroy = new Subject<void>();

  @Input() application!: ApplicationSubmissionDto;
  @Input() files: ApplicationDocumentDto[] = [];
  @Input() parcelType!: string;

  pageTitle: string = 'Application Parcels';
  showCertificateOfTitle: boolean = true;

  fileId: string = '';
  parcels: any[] = [];

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;
  private anchorededParcelUuid: string | undefined;

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private parcelService: ApplicationParcelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.parcelType === 'other') {
      this.pageTitle = 'Other Parcels in the Community';
      this.showCertificateOfTitle = false;
    }

    this.route.fragment.pipe(takeUntil(this.$destroy)).subscribe((fragment) => {
      if (fragment) {
        this.anchorededParcelUuid = fragment;
      }
    });
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

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngAfterContentChecked(): void {
    if (this.anchorededParcelUuid) {
      const el = document.getElementById(this.anchorededParcelUuid);
      if (el) {
        this.anchorededParcelUuid = undefined;
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start',
        });
      }
    }
  }
}
