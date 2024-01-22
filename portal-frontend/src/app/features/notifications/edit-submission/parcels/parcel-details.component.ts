import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import {
  NotificationParcelDto,
  NotificationParcelUpdateDto,
} from '../../../../services/notification-parcel/notification-parcel.dto';
import { NotificationParcelService } from '../../../../services/notification-parcel/notification-parcel.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { EditNotificationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';
import { DeleteParcelDialogComponent } from './delete-parcel/delete-parcel-dialog.component';
import { ParcelEntryFormData } from './parcel-entry/parcel-entry.component';

@Component({
  selector: 'app-notification-parcel-details',
  templateUrl: './parcel-details.component.html',
  styleUrls: ['./parcel-details.component.scss'],
})
export class ParcelDetailsComponent extends StepComponent implements OnInit, AfterViewInit {
  @Output() componentInitialized = new EventEmitter<boolean>();

  currentStep = EditNotificationSteps.Parcel;
  fileId = '';
  submissionUuid = '';
  parcels: NotificationParcelDto[] = [];
  newParcelAdded = false;
  isDirty = false;
  expandedParcel: string = '';

  constructor(
    private router: Router,
    private notificationParcelService: NotificationParcelService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;
        this.loadParcels();
      }
    });

    this.newParcelAdded = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.componentInitialized.emit(true));
  }

  openParcel(index: string) {
    this.expandedParcel = index;
  }

  async loadParcels() {
    this.parcels = (await this.notificationParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    if (!this.parcels || this.parcels.length === 0) {
      await this.onAddParcel();
    }
  }

  async onAddParcel() {
    const parcel = await this.notificationParcelService.create(this.submissionUuid);

    if (parcel) {
      this.parcels.push({
        uuid: parcel!.uuid,
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

    this.isDirty = true;
    parcel.pid = formData.pid !== undefined ? formData.pid : parcel.pid;
    parcel.pin = formData.pid !== undefined ? formData.pin : parcel.pin;
    parcel.civicAddress = formData.civicAddress !== undefined ? formData.civicAddress : parcel.civicAddress;
    parcel.legalDescription =
      formData.legalDescription !== undefined ? formData.legalDescription : parcel.legalDescription;

    parcel.mapAreaHectares = formData.mapArea !== undefined ? formData.mapArea : parcel.mapAreaHectares;
    parcel.ownershipTypeCode = formData.parcelType !== undefined ? formData.parcelType : parcel.ownershipTypeCode;
  }

  private async saveProgress() {
    if (this.isDirty || this.newParcelAdded) {
      const parcelsToUpdate: NotificationParcelUpdateDto[] = [];
      for (const parcel of this.parcels) {
        parcelsToUpdate.push({
          uuid: parcel.uuid,
          pid: parcel.pid?.toString() || null,
          pin: parcel.pin?.toString() || null,
          civicAddress: parcel.civicAddress ?? null,
          legalDescription: parcel.legalDescription,
          mapAreaHectares: parcel.mapAreaHectares,
          ownershipTypeCode: parcel.ownershipTypeCode,
        });
      }
      await this.notificationParcelService.update(parcelsToUpdate);
    }
  }

  async onSave() {
    await this.saveProgress();
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
}
