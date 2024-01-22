import { AfterContentChecked, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NoiDocumentService } from '../../../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentParcelService } from '../../../../../services/notice-of-intent/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionDto } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../../shared/dto/parcel-ownership.type.dto';

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent implements OnInit, OnChanges, OnDestroy, AfterContentChecked {
  $destroy = new Subject<void>();

  @Input() noticeOfIntent!: NoticeOfIntentSubmissionDto;
  @Input() files: NoticeOfIntentDocumentDto[] = [];

  pageTitle: string = 'Notice of Intent Parcels';
  showCertificateOfTitle: boolean = true;

  fileId: string = '';
  parcels: any[] = [];

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;
  private anchorededParcelUuid: string | undefined;

  constructor(
    private noiDocumentService: NoiDocumentService,
    private parcelService: NoticeOfIntentParcelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.fragment.pipe(takeUntil(this.$destroy)).subscribe((fragment) => {
      if (fragment) {
        this.anchorededParcelUuid = fragment;
      }
    });
  }

  async onOpenFile(uuid: string) {
    const file = this.files.find((file) => file.uuid === uuid);
    if (file) {
      await this.noiDocumentService.download(file.uuid, file.fileName);
    }
  }

  async loadParcels(fileNumber: string) {
    this.parcels = await this.parcelService.fetchParcels(fileNumber);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadParcels(this.noticeOfIntent.fileNumber);
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
