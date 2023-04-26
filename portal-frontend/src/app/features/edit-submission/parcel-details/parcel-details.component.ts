import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { APPLICATION_OWNER, ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ToastService } from '../../../services/toast/toast.service';
import { parseStringToBoolean } from '../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';
import { DeleteParcelDialogComponent } from './delete-parcel/delete-parcel-dialog.component';
import { ParcelEntryFormData } from './parcel-entry/parcel-entry.component';

@Component({
  selector: 'app-parcel-details',
  templateUrl: './parcel-details.component.html',
  styleUrls: ['./parcel-details.component.scss'],
})
export class ParcelDetailsComponent extends StepComponent implements OnInit, AfterViewInit {
  @Output() componentInitialized = new EventEmitter<boolean>();

  currentStep = EditApplicationSteps.AppParcel;
  fileId = '';
  submissionUuid = '';
  parcels: ApplicationParcelDto[] = [];
  $owners = new BehaviorSubject<ApplicationOwnerDto[]>([]);
  newParcelAdded = false;

  constructor(
    private router: Router,
    private applicationParcelService: ApplicationParcelService,
    private applicationOwnerService: ApplicationOwnerService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;
        this.loadParcels();
        const nonAgentOwners = applicationSubmission.owners.filter(
          (owner) => owner.type.code !== APPLICATION_OWNER.AGENT
        );
        this.$owners.next(nonAgentOwners);
      }
    });

    this.newParcelAdded = false;
  }

  ngAfterViewInit(): void {
    setTimeout((_) => this.componentInitialized.emit(true));
  }

  async loadParcels() {
    const parcels = (await this.applicationParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    this.parcels = parcels.filter((p) => p.parcelType === PARCEL_TYPE.APPLICATION);
    if (!this.parcels || this.parcels.length === 0) {
      await this.onAddParcel();
    }
  }

  async onAddParcel() {
    const parcel = await this.applicationParcelService.create(this.submissionUuid);

    if (parcel) {
      this.parcels.push({
        uuid: parcel!.uuid,
        parcelType: PARCEL_TYPE.APPLICATION,
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
    const parcelsToUpdate: ApplicationParcelUpdateDto[] = [];
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

    await this.applicationParcelService.update(parcelsToUpdate);
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

  async onOwnersUpdated() {
    const owners = await this.applicationOwnerService.fetchBySubmissionId(this.submissionUuid);
    if (owners) {
      const nonAgentOwners = owners.filter((owner) => owner.type.code !== APPLICATION_OWNER.AGENT);
      this.$owners.next(nonAgentOwners);
    }
  }

  expandedParcel: string = '';

  openParcel(index: string) {
    this.expandedParcel = index;
  }
}
