import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { ApplicationOwnerDto } from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
} from '../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { OWNER_TYPE } from '../../../../shared/dto/owner.dto';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
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
  isDirty = false;

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationParcelService: ApplicationParcelService,
    private applicationOwnerService: ApplicationOwnerService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;
        this.loadParcels();
        const parcelOwners = applicationSubmission.owners.filter(
          (owner) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code),
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
    this.parcels = (await this.applicationParcelService.fetchBySubmissionUuid(this.submissionUuid)) || [];
    if (!this.parcels || this.parcels.length === 0) {
      await this.onAddParcel();
    }
  }

  async onAddParcel() {
    const parcel = await this.applicationParcelService.create(this.submissionUuid);

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
    if (formData.owners) {
      parcel.owners = formData.owners;
    }
  }

  private async saveProgress() {
    if (this.isDirty || this.newParcelAdded) {
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
          ownerUuids: parcel.owners.map((owner) => owner.uuid),
        });
      }
      await this.applicationParcelService.update(parcelsToUpdate);
    }
  }

  async onSave() {
    await this.saveProgress();
  }

  async onDelete(parcelUuid: string, parcelNumber: number) {
    this.dialog
      .open(DeleteParcelDialogComponent, {
        panelClass: 'no-padding',
        data: {
          parcelUuid,
          parcelNumber,
        },
      })
      .beforeClosed()
      .subscribe((result) => {
        if (result) {
          this.parcels = this.parcels.filter((parcel) => parcel.uuid !== parcelUuid);
        }
      });
  }

  async reloadApplication() {
    const updatedApp = await this.applicationSubmissionService.getByUuid(this.submissionUuid);
    this.$applicationSubmission.next(updatedApp);
  }

  expandedParcel: string = '';

  openParcel(index: string) {
    this.expandedParcel = index;
  }

  async reloadOwners() {
    const owners = await this.applicationOwnerService.fetchBySubmissionId(this.submissionUuid);
    if (owners) {
      const parcelOwners = owners.filter(
        (owner) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code),
      );
      this.$owners.next(parcelOwners);
    }
  }
}
