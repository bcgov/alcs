import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { NoticeOfIntentOwnerDto } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import {
  NoticeOfIntentParcelDto,
  NoticeOfIntentParcelUpdateDto,
} from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { OWNER_TYPE } from '../../../../shared/dto/owner.dto';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditNoiSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';
import { DeleteParcelDialogComponent } from './delete-parcel/delete-parcel-dialog.component';
import { ParcelEntryFormData } from './parcel-entry/parcel-entry.component';

@Component({
  selector: 'app-noi-parcel-details',
  templateUrl: './parcel-details.component.html',
  styleUrls: ['./parcel-details.component.scss'],
})
export class ParcelDetailsComponent extends StepComponent implements OnInit, AfterViewInit {
  @Output() componentInitialized = new EventEmitter<boolean>();

  currentStep = EditNoiSteps.Parcel;
  fileId = '';
  submissionUuid = '';
  parcels: NoticeOfIntentParcelDto[] = [];
  $owners = new BehaviorSubject<NoticeOfIntentOwnerDto[]>([]);
  newParcelAdded = false;
  isDirty = false;

  constructor(
    private router: Router,
    private noiParcelService: NoticeOfIntentParcelService,
    private noticeOfIntentOwnerService: NoticeOfIntentOwnerService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;
        this.loadParcels();
        const parcelOwners = noiSubmission.owners.filter(
          (owner) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code)
        );
        this.$owners.next(parcelOwners);
      }
    });

    this.newParcelAdded = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.componentInitialized.emit(true));
  }

  async loadParcels() {
    this.parcels = (await this.noiParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    if (!this.parcels || this.parcels.length === 0) {
      await this.onAddParcel();
    }
  }

  async onAddParcel() {
    const parcel = await this.noiParcelService.create(this.submissionUuid);

    if (parcel) {
      this.parcels.push({
        uuid: parcel!.uuid,
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

    this.isDirty = true;
    parcel.pid = formData.pid !== undefined ? formData.pid : parcel.pid;
    parcel.pin = formData.pid !== undefined ? formData.pin : parcel.pin;
    parcel.civicAddress = formData.civicAddress !== undefined ? formData.civicAddress : parcel.civicAddress;
    parcel.legalDescription =
      formData.legalDescription !== undefined ? formData.legalDescription : parcel.legalDescription;

    parcel.mapAreaHectares = formData.mapArea !== undefined ? formData.mapArea : parcel.mapAreaHectares;
    parcel.ownershipTypeCode = formData.parcelType !== undefined ? formData.parcelType : parcel.ownershipTypeCode;
    parcel.isFarm = formData.isFarm !== undefined ? parseStringToBoolean(formData.isFarm) : parcel.isFarm;
    parcel.purchasedDate =
      formData.purchaseDate !== undefined ? formData.purchaseDate?.getTime() : parcel.purchasedDate;
    parcel.isConfirmedByApplicant = formData.isConfirmedByApplicant || false;
    parcel.crownLandOwnerType =
      formData.crownLandOwnerType !== undefined ? formData.crownLandOwnerType : parcel.crownLandOwnerType;
    if (formData.owners) {
      parcel.owners = formData.owners;
    }
  }

  private async saveProgress() {
    if (this.isDirty || this.newParcelAdded) {
      const parcelsToUpdate: NoticeOfIntentParcelUpdateDto[] = [];
      for (const parcel of this.parcels) {
        parcelsToUpdate.push({
          uuid: parcel.uuid,
          pid: parcel.pid?.toString() || null,
          pin: parcel.pin?.toString() || null,
          civicAddress: parcel.civicAddress ?? null,
          legalDescription: parcel.legalDescription,
          isFarm: parcel.isFarm,
          purchasedDate: parcel.purchasedDate,
          mapAreaHectares: parcel.mapAreaHectares,
          ownershipTypeCode: parcel.ownershipTypeCode,
          isConfirmedByApplicant: parcel.isConfirmedByApplicant,
          crownLandOwnerType: parcel.crownLandOwnerType,
          ownerUuids: parcel.owners.map((owner) => owner.uuid),
        });
      }
      await this.noiParcelService.update(parcelsToUpdate);
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
          this.parcels = this.parcels.filter(parcel => parcel.uuid !== parcelUuid);
        }
      });
  }

  async onOwnersUpdated() {
    const owners = await this.noticeOfIntentOwnerService.fetchBySubmissionId(this.submissionUuid);
    if (owners) {
      const parcelOwners = owners.filter(
        (owner) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code)
      );
      this.$owners.next(parcelOwners);
    }
  }

  expandedParcel: string = '';

  openParcel(index: string) {
    this.expandedParcel = index;
  }
}
