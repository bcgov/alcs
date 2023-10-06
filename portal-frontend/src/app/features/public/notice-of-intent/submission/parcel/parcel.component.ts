import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../../services/application-parcel/application-parcel.dto';
import { PublicNoticeOfIntentSubmissionDto } from '../../../../../services/public/public-notice-of-intent.dto';
import { PublicParcelDto } from '../../../../../services/public/public.dto';

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent {
  $destroy = new Subject<void>();

  @Input() submission!: PublicNoticeOfIntentSubmissionDto;
  @Input() parcels: PublicParcelDto[] = [];

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;
  pageTitle: string = 'Identify Parcel(s) Under Application';

  fileId = '';
  submissionUuid = '';

  constructor() {}

  ngOnInit(): void {
    this.fileId = this.submission.fileNumber;
    this.submissionUuid = this.submission.uuid;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
