import { AfterContentChecked, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationParcelService } from '../../../../../services/notification/notification-parcel/notification-parcel.service';
import { NotificationSubmissionDto } from '../../../../../services/notification/notification.dto';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../../shared/dto/parcel-ownership.type.dto';

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent implements OnInit, OnChanges, OnDestroy, AfterContentChecked {
  $destroy = new Subject<void>();

  @Input() notificationSubmission!: NotificationSubmissionDto;

  fileId: string = '';
  parcels: any[] = [];

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;
  private anchoredParcelUuid: string | undefined;

  constructor(private notificationParcelService: NotificationParcelService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.fragment.pipe(takeUntil(this.$destroy)).subscribe((fragment) => {
      if (fragment) {
        this.anchoredParcelUuid = fragment;
      }
    });
  }

  async loadParcels(fileNumber: string) {
    this.parcels = await this.notificationParcelService.fetchParcels(fileNumber);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadParcels(this.notificationSubmission.fileNumber);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngAfterContentChecked(): void {
    if (this.anchoredParcelUuid) {
      const el = document.getElementById(this.anchoredParcelUuid);
      if (el) {
        this.anchoredParcelUuid = undefined;
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start',
        });
      }
    }
  }
}
