import { Component, Input } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationParcelDto, PARCEL_TYPE } from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { formatBooleanToYesNoString } from '../../../shared/utils/boolean-helper';

interface ApplicationParcelExtended extends ApplicationParcelDto {
  isFarmText?: string;
}

@Component({
  selector: 'app-parcel',
  templateUrl: './parcel.component.html',
  styleUrls: ['./parcel.component.scss'],
})
export class ParcelComponent {
  $destroy = new Subject<void>();

  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;

  fileId: string = '';

  parcelsWithOwners: any[] = [];

  parcels: ApplicationParcelExtended[] = [];

  constructor(private applicationParcelService: ApplicationParcelService) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.loadParcels();
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.applicationParcelService.fetchByFileId(this.fileId)) || [];
    this.parcels = parcels
      .filter((p) => p.parcelType === PARCEL_TYPE.APPLICATION)
      .map((p) => ({ ...p, isFarmText: formatBooleanToYesNoString(p.isFarm) }));
    console.log('loadParcels', parcels);
  }
}
