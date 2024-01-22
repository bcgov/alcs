import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent/notice-of-intent-parcel/notice-of-intent-parcel.service';

@Component({
  selector: 'app-parcel-prep',
  templateUrl: './parcel-prep.component.html',
  styleUrls: ['./parcel-prep.component.scss']
})
export class ParcelPrepComponent implements OnChanges {
  @Input() fileNumber = '';

  displayedColumns = ['number', 'pid', 'pin', 'civicAddress', 'area', 'alrArea', 'owners', 'actions'];
  parcels: {
    pin?: string;
    pid?: string;
    mapAreaHectares: string;
    alrArea: number;
    owners: string;
    fullOwners: string;
    hasManyOwners: boolean;
    uuid: string;
  }[] = [];

  constructor(private parcelService: NoticeOfIntentParcelService, private router: Router) {}

  async loadParcels(fileNumber: string) {
    const parcels = await this.parcelService.fetchParcels(fileNumber);
    this.parcels = parcels.map((parcel) => ({
      ...parcel,
      owners: `${parcel.owners[0].displayName} ${parcel.owners.length > 1 ? ' et al.' : ''}`,
      fullOwners: parcel.owners.map((owner) => owner.displayName).join(', '),
      hasManyOwners: parcel.owners.length > 1,
    }));
  }

  async saveParcel(uuid: string, alrArea: string | null) {
    await this.parcelService.setParcelArea(uuid, alrArea ? parseFloat(alrArea) : null);
  }

  ngOnChanges(): void {
    this.loadParcels(this.fileNumber);
  }

  async navigateToParcelDetails(uuid: any) {
    await this.router.navigate(['notice-of-intent', this.fileNumber, 'applicant-info'], {
      fragment: uuid,
    });
  }
}
