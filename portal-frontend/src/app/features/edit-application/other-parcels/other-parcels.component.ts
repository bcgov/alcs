import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { formatBooleanToString } from '../../../shared/utils/boolean-helper';
import { getLetterCombinations } from '../../../shared/utils/number-to-letter-helper';
import { parseStringToBoolean } from '../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../edit-application.component';
import { DeleteParcelDialogComponent } from '../parcel-details/delete-parcel/delete-parcel-dialog.component';
import { ParcelEntryFormData } from '../parcel-details/parcel-entry/parcel-entry.component';
import { OtherParcelConfirmationDialogComponent } from './other-parcel-confirmation-dialog/other-parcel-confirmation-dialog.component';

const PLACE_HOLDER_UUID_FOR_INITIAL_PARCEL = 'placeHolderUuidForInitialParcel';

@Component({
  selector: 'app-other-parcels',
  templateUrl: './other-parcels.component.html',
  styleUrls: ['./other-parcels.component.scss'],
})
export class OtherParcelsComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  @Input() showErrors = false;
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep = EditApplicationSteps.OtherParcel;
  $destroy = new Subject<void>();

  fileId: string = '';
  owners: ApplicationOwnerDetailedDto[] = [];
  PARCEL_TYPE = PARCEL_TYPE;

  hasOtherParcelsInCommunity = new FormControl<string | null>(null, [Validators.required]);

  otherParcelsForm = new FormGroup({
    hasOtherParcelsInCommunity: this.hasOtherParcelsInCommunity,
  });

  otherParcels: ApplicationParcelDto[] = [];
  $owners = new BehaviorSubject<ApplicationOwnerDto[]>([]);
  application?: ApplicationDetailedDto;
  formDisabled = true;
  newParcelAdded = false;
  hasCrownLandParcels = false;
  parcelEntryChanged = false;

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

        this.hasCrownLandParcels = application.owners.reduce((hasCrownLand, owner) => {
          return hasCrownLand || owner.parcels.some((parcel) => parcel.ownershipTypeCode === 'CRWN');
        }, false);

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

    this.parcelEntryChanged = true;

    parcel.pid = formData.pid !== undefined ? formData.pid : parcel.pid;
    parcel.pin = formData.pid !== undefined ? formData.pin : parcel.pin;
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
        pid: parcel.pid?.toString() || null,
        pin: parcel.pin?.toString() || null,
        legalDescription: parcel.legalDescription,
        isFarm: parcel.isFarm,
        purchasedDate: parcel.purchasedDate,
        mapAreaHectares: parcel.mapAreaHectares,
        ownershipTypeCode: parcel.ownershipTypeCode,
        crownLandOwnerType: parcel.crownLandOwnerType,
        isConfirmedByApplicant: false,
        ownerUuids: parcel.owners.map((owner) => owner.uuid),
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

      if (this.showErrors) {
        this.otherParcelsForm.markAllAsTouched();
      }
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
    const parsedHasParcels = parseStringToBoolean($event.value);

    if (
      parsedHasParcels === false &&
      (this.otherParcels.some((e) => e.uuid !== PLACE_HOLDER_UUID_FOR_INITIAL_PARCEL) || this.parcelEntryChanged)
    ) {
      this.dialog
        .open(OtherParcelConfirmationDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
        })
        .beforeClosed()
        .subscribe(async (result) => {
          if (result) {
            this.hasOtherParcelsInCommunity.patchValue('false');
            this.formDisabled = true;
            await this.setHasOtherParcelsInCommunity(false);
            await this.saveProgress();
            await this.reloadApplication();
            this.parcelEntryChanged = false;
          } else {
            this.hasOtherParcelsInCommunity.patchValue('true');
            this.formDisabled = false;
            await this.setHasOtherParcelsInCommunity(true);
          }
        });
    } else {
      this.formDisabled = !parsedHasParcels ?? true;
      await this.setHasOtherParcelsInCommunity(parsedHasParcels);
    }
  }

  private async setHasOtherParcelsInCommunity(value?: boolean | null) {
    await this.applicationService.updatePending(this.fileId, {
      hasOtherParcelsInCommunity: value,
    });
    await this.reloadApplication();
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

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }

  getLetterIndex(num: number) {
    return getLetterCombinations(num);
  }
}
