import { Component, OnInit } from '@angular/core';
import { ParcelDto } from '../../../services/parcel/parcel.dto';

@Component({
  selector: 'app-parcel-details',
  templateUrl: './parcel-details.component.html',
  styleUrls: ['./parcel-details.component.scss'],
})
export class ParcelDetailsComponent implements OnInit {
  parcels: ParcelDto[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadParcels();
  }

  private async loadParcels() {
    this.parcels = [
      {
        PID: '100111222',
        PIN: '133444555',
        legalDescription: 'This is a legal description',
        mapAreaHectares: 10,
        purchasedDate: Date.now(),
        isFarm: false,
        owners: [
          {
            type: 'individual',
            firstName: 'First',
            lastName: 'Owner',
            phoneNumber: '1111111111',
            email: 'someEmail.com',
          },
          {
            type: 'individual',
            firstName: 'Second',
            lastName: 'Owner',
            phoneNumber: '2222222222',
            email: 'someEmail2.com',
          },
        ],
      },
      {
        PID: '200111222',
        PIN: '133444555',
        legalDescription: 'This is a legal description 2',
        mapAreaHectares: 10,
        purchasedDate: Date.now(),
        isFarm: false,
        owners: [
          {
            type: 'individual',
            firstName: 'First',
            lastName: 'Owner',
            phoneNumber: '1111111111',
            email: 'someEmail.com',
          },
          {
            type: 'individual',
            firstName: 'Second',
            lastName: 'Owner',
            phoneNumber: '2222222222',
            email: 'someEmail2.com',
          },
        ],
      },
    ];
  }

  async onAddOwner() {}

  async onAddParcel() {
    this.parcels.push({
      PID: '300111222',
      PIN: '333444555',
      legalDescription: 'This is a legal description',
      mapAreaHectares: 10,
      purchasedDate: Date.now(),
      isFarm: false,
      owners: [
        {
          type: 'individual',
          firstName: 'First',
          lastName: 'Owner',
          phoneNumber: '1111111111',
          email: 'someEmail.com',
        },
        {
          type: 'individual',
          firstName: 'Second',
          lastName: 'Owner',
          phoneNumber: '2222222222',
          email: 'someEmail2.com',
        },
      ],
    });
  }

  async onSaveExit() {
    alert('onSaveExit');
  }

  async onSave() {
    alert('onSave');
  }
}
