import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  APPLICATION_OWNER,
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
} from '../../../services/application-owner/application-owner.dto';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDetailedDto, ApplicationUpdateDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { formatBooleanToString } from '../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../shared/utils/string-helper';
import { DeleteParcelDialogComponent } from '../parcel-details/delete-parcel/delete-parcel-dialog.component';
import { ParcelEntryFormData } from '../parcel-details/parcel-entry/parcel-entry.component';

const PLACE_HOLDER_UUID_FOR_INITIAL_PARCEL = 'placeHolderUuidForInitialParcel';
@Component({
  selector: 'app-other-parcels',
  templateUrl: './other-parcels.component.html',
  styleUrls: ['./other-parcels.component.scss'],
})
export class OtherParcelsComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  fileId: string = '';
  owners: ApplicationOwnerDetailedDto[] = [];
  PARCEL_TYPE = PARCEL_TYPE;

  $destroy = new Subject<void>();

  hasOtherParcelsInCommunity = new FormControl<string | null>(null);

  otherParcelsForm = new FormGroup({
    hasOtherParcelsInCommunity: this.hasOtherParcelsInCommunity,
  });

  otherParcels: ApplicationParcelDto[] = [];
  $owners = new BehaviorSubject<ApplicationOwnerDto[]>([]);
  application?: ApplicationDetailedDto;
  formDisabled = true;
  newParcelAdded = false;

  constructor(
    private applicationParcelService: ApplicationParcelService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
        this.fileId = application.fileNumber;
        const nonAgentOwners = application.owners.filter((owner) => owner.type.code !== APPLICATION_OWNER.AGENT);
        this.owners = nonAgentOwners.map((o) => ({
          ...o,
          parcels: o.parcels.filter((p) => p.parcelType === PARCEL_TYPE.OTHER),
        }));
        this.$owners.next(nonAgentOwners);

        this.setupOtherParcelsData();
        this.setupOtherParcelsForm();
      }
    });

    this.newParcelAdded = false;
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onParcelFormChange(formData: Partial<ParcelEntryFormData>) {
    const parcel = this.otherParcels.find((e) => e.uuid === formData.uuid);
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

  private async reloadApplication() {
    const application = await this.applicationService.getByFileId(this.fileId);
    this.$application.next(application);
  }

  private async saveProgress() {
    const parcelsToUpdate: ApplicationParcelUpdateDto[] = [];

    // replace placeholder uuid with the real one before saving
    await this.replacePlaceholderParcel();

    // delete all OTHER parcels if user answered 'NO' on 'Is there other parcels in the community'
    if (!parseStringToBoolean(this.hasOtherParcelsInCommunity.getRawValue())) {
      if (this.otherParcels.some((e) => e.uuid !== PLACE_HOLDER_UUID_FOR_INITIAL_PARCEL)) {
        await this.applicationParcelService.deleteMany(
          this.otherParcels.filter((e) => e.uuid !== PLACE_HOLDER_UUID_FOR_INITIAL_PARCEL).map((e) => e.uuid)
        );
      }

      return;
    }

    for (const parcel of this.otherParcels) {
      parcelsToUpdate.push({
        uuid: parcel.uuid,
        pid: parcel.pid?.toString(),
        pin: parcel.pin?.toString(),
        legalDescription: parcel.legalDescription,
        isFarm: parcel.isFarm,
        purchasedDate: parcel.purchasedDate,
        mapAreaHectares: parcel.mapAreaHectares,
        ownershipTypeCode: parcel.ownershipTypeCode,
        isConfirmedByApplicant: false,
        ownerUuids: null,
      });
    }

    await this.applicationParcelService.update(parcelsToUpdate);
  }

  async onSave() {
    await this.saveProgress();
  }

  async onSaveExit() {
    if (this.fileId) {
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  async onAddParcel() {
    const parcel = await this.applicationParcelService.create(this.fileId, PARCEL_TYPE.OTHER);

    if (parcel) {
      await this.replacePlaceholderParcel();

      this.otherParcels.push({
        uuid: parcel!.uuid,
        parcelType: PARCEL_TYPE.OTHER,
        documents: [],
        owners: [],
        isConfirmedByApplicant: false,
      });

      this.newParcelAdded = true;
    } else {
      this.toastService.showErrorToast('Error adding new parcel. Please refresh the page and try again.');
    }
  }

  addPlaceHolderParcel() {
    this.otherParcels.push({
      uuid: PLACE_HOLDER_UUID_FOR_INITIAL_PARCEL,
      parcelType: PARCEL_TYPE.OTHER,
      documents: [],
      owners: [],
      isConfirmedByApplicant: false,
    });
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
      .subscribe(async (result) => {
        if (result) {
          await this.reloadApplication();
        }
      });
  }

  setupOtherParcelsForm() {
    if (this.application) {
      this.formDisabled = !this.application.hasOtherParcelsInCommunity ?? true;

      this.otherParcelsForm.patchValue({
        hasOtherParcelsInCommunity: formatBooleanToString(this.application.hasOtherParcelsInCommunity),
      });
    }
  }

  async setupOtherParcelsData() {
    const parcels = (await this.applicationParcelService.fetchByFileId(this.fileId)) || [];
    this.otherParcels = parcels.filter((p) => p.parcelType === PARCEL_TYPE.OTHER);
    if (!this.otherParcels || this.otherParcels.length === 0) {
      this.addPlaceHolderParcel();
    }
  }

  async onHasOtherParcelsInCommunityChange($event: MatButtonToggleChange) {
    this.formDisabled = !parseStringToBoolean($event.value) ?? true;

    await this.applicationService.updatePending(this.fileId, {
      ...this.application,
      hasOtherParcelsInCommunity: parseStringToBoolean($event.value),
    } as ApplicationUpdateDto);
    await this.applicationService.getByFileId(this.fileId);
  }

  async replacePlaceholderParcel() {
    const placeHolderParcel = this.otherParcels.find((p) => p.uuid === PLACE_HOLDER_UUID_FOR_INITIAL_PARCEL);

    if (placeHolderParcel && parseStringToBoolean(this.hasOtherParcelsInCommunity.getRawValue())) {
      const parcel = await this.applicationParcelService.create(this.fileId, PARCEL_TYPE.OTHER);
      if (parcel) {
        placeHolderParcel.uuid = parcel.uuid;
      }
    }
  }
}
