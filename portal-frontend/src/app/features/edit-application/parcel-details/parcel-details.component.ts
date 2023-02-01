import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { parseStringToBoolean } from '../../../shared/utils/string-helper';
import { DeleteParcelDialogComponent } from './delete-parcel/delete-parcel-dialog.component';
import { ParcelEntryFormData } from './parcel-entry/parcel-entry.component';

@Component({
  selector: 'app-parcel-details',
  templateUrl: './parcel-details.component.html',
  styleUrls: ['./parcel-details.component.scss'],
})
export class ParcelDetailsComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;

  $destroy = new Subject<void>();
  fileId!: string;

  parcels: ApplicationParcelDto[] = [];
  $owners = new BehaviorSubject<ApplicationOwnerDto[]>([]);

  newParcelAdded = false;

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private applicationParcelService: ApplicationParcelService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.loadParcels();
        this.$owners.next(application.owners);
      }
    });
    this.newParcelAdded = false;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadParcels() {
    const parcels = (await this.applicationParcelService.fetchByFileId(this.fileId)) || [];
    this.parcels = parcels.filter((p) => p.parcelType === PARCEL_TYPE.APPLICATION);
    if (!this.parcels || this.parcels.length === 0) {
      await this.onAddParcel();
    }
  }

  async onAddParcel() {
    const parcel = await this.applicationParcelService.create(this.fileId);

    if (parcel) {
      this.parcels.push({
        uuid: parcel!.uuid,
        parcelType: PARCEL_TYPE.APPLICATION,
        documents: [],
        owners: [],
        isConfirmedByApplicant: false,
      });
      this.newParcelAdded = true;
    } else {
      this.toastService.showErrorToast('Error adding new parcel. Please refresh page and try again.');
    }
  }

  async onParcelFormChange(formData: Partial<ParcelEntryFormData>) {
    const parcel = this.parcels.find((e) => e.uuid === formData.uuid);
    if (!parcel) {
      this.toastService.showErrorToast('Error updating the parcel. Please refresh page and try again.');
      return;
    }

    parcel.pid = formData.pid;
    parcel.pin = formData.pin;
    parcel.legalDescription = formData.legalDescription;
    parcel.mapAreaHectares = formData.mapArea;
    parcel.ownershipTypeCode = formData.parcelType;
    parcel.isFarm = parseStringToBoolean(formData.isFarm);
    parcel.purchasedDate = formData.purchaseDate?.getTime();
    parcel.isConfirmedByApplicant = formData.isConfirmedByApplicant || false;
  }

  private async saveProgress() {
    const parcelsToUpdate: ApplicationParcelUpdateDto[] = [];
    for (const parcel of this.parcels) {
      parcelsToUpdate.push({
        uuid: parcel.uuid,
        pid: parcel.pid?.toString(),
        pin: parcel.pin?.toString(),
        legalDescription: parcel.legalDescription,
        isFarm: parcel.isFarm,
        purchasedDate: parcel.purchasedDate,
        mapAreaHectares: parcel.mapAreaHectares,
        ownershipTypeCode: parcel.ownershipTypeCode,
        isConfirmedByApplicant: parcel.isConfirmedByApplicant,
      });
    }

    await this.applicationParcelService.update(parcelsToUpdate);
  }

  async onSave() {
    await this.saveProgress();
  }

  async onSaveExit() {
    if (this.fileId) {
      await this.saveProgress();
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  async onDelete(parcelUuid: string, parcelNumber: number) {
    this.dialog
      .open(DeleteParcelDialogComponent, {
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          parcelUuid,
          parcelNumber,
        },
      })
      .beforeClosed()
      .subscribe((result) => {
        if (result) {
          this.loadParcels();
        }
      });
  }

  async onFilesUpdated() {
    const parcels = (await this.applicationParcelService.fetchByFileId(this.fileId)) || [];
    for (const parcel of parcels) {
      const existingParcel = this.parcels.find((e) => e.uuid === parcel.uuid);
      if (existingParcel) {
        existingParcel.documents = parcel.documents;
      }
    }
  }

  async onAppUpdated() {
    const app = await this.applicationService.getByFileId(this.fileId);
    this.$application.next(app);
  }
}
