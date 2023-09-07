import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { NotificationParcelDto } from '../../../../services/notification-parcel/notification-parcel.dto';
import { NotificationParcelService } from '../../../../services/notification-parcel/notification-parcel.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent {
  $destroy = new Subject<void>();

  @Input() $notificationSubmission!: BehaviorSubject<NotificationSubmissionDetailedDto | undefined>;
  @Input() showErrors = true;
  @Input() showEdit = true;

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;

  fileId = '';
  submissionUuid = '';
  parcels: NotificationParcelDto[] = [];
  noticeOfIntentSubmission!: NotificationSubmissionDetailedDto;
  updatedFields: string[] = [];

  constructor(private noticeOfIntentParcelService: NotificationParcelService, private router: Router) {}

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;
        this.noticeOfIntentSubmission = noiSubmission;
        this.loadParcels();
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    this.parcels = (await this.noticeOfIntentParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
  }

  async onEditParcelsClick($event: any) {
    $event.stopPropagation();
    await this.router.navigateByUrl(`notification/${this.fileId}/edit/0?errors=t`);
  }

  async onEditParcelClick(uuid: string) {
    await this.router.navigateByUrl(`notification/${this.fileId}/edit/0?parcelUuid=${uuid}&errors=t`);
  }
}
