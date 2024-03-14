import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../../services/application-parcel/application-parcel.dto';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelDto } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcelService } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { ParcelService } from '../../../../../services/parcel/parcel.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { OWNER_TYPE } from '../../../../../shared/dto/owner.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { CrownOwnerDialogComponent } from '../../../../../shared/owner-dialogs/crown-owner-dialog/crown-owner-dialog.component';
import { OwnerDialogComponent } from '../../../../../shared/owner-dialogs/owner-dialog/owner-dialog.component';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { RemoveFileConfirmationDialogComponent } from '../../../../applications/alcs-edit-submission/remove-file-confirmation-dialog/remove-file-confirmation-dialog.component';
import { ParcelEntryConfirmationDialogComponent } from './parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { scrollToElement } from '../../../../../shared/utils/scroll-helper';
import { openFileInline } from '../../../../../shared/utils/file';

export interface ParcelEntryFormData {
  uuid: string;
  legalDescription: string | undefined | null;
  mapArea: string | undefined | null;
  pin: string | undefined | null;
  pid: string | undefined | null;
  civicAddress: string | undefined | null;
  parcelType: string | undefined | null;
  isFarm: string | undefined | null;
  purchaseDate?: Date | null;
  crownLandOwnerType?: string | null;
  isConfirmedByApplicant: boolean;
  owners: NoticeOfIntentOwnerDto[];
}

@Component({
  selector: 'app-noi-parcel-entry[parcel][fileId][submissionUuid]',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  @Input() parcel!: NoticeOfIntentParcelDto;
  @Input() fileId!: string;
  @Input() submissionUuid!: string;
  @Input() $owners: BehaviorSubject<NoticeOfIntentOwnerDto[]> = new BehaviorSubject<NoticeOfIntentOwnerDto[]>([]);

  @Input() enableOwners = true;
  @Input() enableCertificateOfTitleUpload = true;
  @Input() enableUserSignOff = true;
  @Input() enableAddNewOwner = true;
  @Input() showErrors = false;
  @Input() isDraft = false;

  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();
  @Output() private onSaveProgress = new EventEmitter<void>();
  @Output() onOwnersUpdated = new EventEmitter<void>();
  @Output() onOwnersDeleted = new EventEmitter<void>();

  owners: NoticeOfIntentOwnerDto[] = [];
  filteredOwners: (NoticeOfIntentOwnerDto & { isSelected: boolean })[] = [];

  searchBy = new FormControl<string | null>(null);
  isCrownLand: boolean | null = null;
  isCertificateOfTitleRequired = true;
  showVirusError = false;

  parcelType = new FormControl<string | null>(null, [Validators.required]);
  pidPin = new FormControl<string>({
    disabled: true,
    value: '',
  });
  legalDescription = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required]
  );
  mapArea = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required]
  );
  pid = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required]
  );
  pin = new FormControl<string | null>({
    disabled: true,
    value: null,
  });
  civicAddress = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required]
  );
  isFarm = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required]
  );
  purchaseDate = new FormControl<any | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required]
  );
  isConfirmedByApplicant = new FormControl<boolean>(
    {
      disabled: true,
      value: false,
    },
    [Validators.requiredTrue]
  );
  crownLandOwnerType = new FormControl<string | null>(null);

  parcelForm = new FormGroup({
    pidPin: this.pidPin,
    legalDescription: this.legalDescription,
    mapArea: this.mapArea,
    pin: this.pin,
    pid: this.pid,
    civicAddress: this.civicAddress,
    parcelType: this.parcelType,
    isFarm: this.isFarm,
    purchaseDate: this.purchaseDate,
    crownLandOwnerType: this.crownLandOwnerType,
    isConfirmedByApplicant: this.isConfirmedByApplicant,
    searchBy: this.searchBy,
  });
  pidPinPlaceholder = '';
  selectedOwner?: NoticeOfIntentOwnerDto = undefined;

  ownerInput = new FormControl<string | null>({
    disabled: true,
    value: null,
  });

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;
  maxPurchasedDate = new Date();

  constructor(
    private parcelService: ParcelService,
    private noticeOfIntentParcelService: NoticeOfIntentParcelService,
    public noticeOfIntentOwnerService: NoticeOfIntentOwnerService,
    public noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupForm();

    this.$owners.subscribe((owners) => {
      this.owners = owners;
      this.filteredOwners = this.mapOwners(owners);
      const selectedOwner =
        this.parcel.owners.length > 0
          ? this.filteredOwners.find((owner) => owner.uuid === this.parcel.owners[0].uuid)
          : undefined;

      this.selectedOwner = selectedOwner;
      this.parcel.owners = this.parcel.owners.map((owner) => {
        const updatedOwner = owners.find((updatedOwner) => updatedOwner.uuid === owner.uuid)!;
        if (!updatedOwner) {
          console.warn('Failed to find user in array');
          return owner;
        }
        return updatedOwner;
      });
    });
  }

  async onSearch() {
    let result;
    const searchValue = this.pidPin.value;
    if (!searchValue || searchValue.length === 0) {
      return;
    }

    if (this.searchBy.getRawValue() === 'pin') {
      result = await this.parcelService.getByPin(searchValue);
    } else {
      result = await this.parcelService.getByPid(searchValue);
    }

    if (result) {
      this.legalDescription.setValue(result.legalDescription);
      this.mapArea.setValue(result.mapArea);

      if (result.pin) {
        this.pin.setValue(result.pin);
      }

      if (result.pid) {
        this.pid.setValue(result.pid);
      }

      this.emitFormChangeOnSearchActions();
    }
  }

  onReset() {
    this.parcelForm.controls.pidPin.reset();
    this.parcelForm.controls.pid.reset();
    this.parcelForm.controls.pin.reset();
    this.parcelForm.controls.legalDescription.reset();
    this.parcelForm.controls.mapArea.reset();
    this.parcelForm.controls.purchaseDate.reset();
    this.parcelForm.controls.isFarm.reset();
    this.parcelForm.controls.civicAddress.reset();

    this.emitFormChangeOnSearchActions();

    if (this.showErrors) {
      this.parcelForm.markAllAsTouched();
    } else {
      this.parcelForm.controls.isFarm.markAsTouched();
    }
  }

  private emitFormChangeOnSearchActions() {
    this.onFormGroupChange.emit({
      uuid: this.parcel.uuid,
      legalDescription: this.legalDescription.getRawValue(),
      mapArea: this.mapArea.getRawValue(),
      pin: this.pin.getRawValue(),
      pid: this.pid.getRawValue(),
    });
  }

  onChangeParcelType($event: MatButtonToggleChange) {
    const formHasValues =
      this.legalDescription.value ||
      this.mapArea.value ||
      this.pid.value ||
      this.pin.value ||
      this.purchaseDate.value ||
      this.isFarm.value ||
      this.civicAddress.value;

    this.parcelForm.enable();
    this.ownerInput.enable();

    const changeParcelType = () => {
      if ($event.value === this.PARCEL_OWNERSHIP_TYPES.CROWN) {
        this.searchBy.setValue(null);
        this.pidPinPlaceholder = '';
        this.isCrownLand = true;
        this.pid.removeValidators([Validators.required]);
        this.purchaseDate.disable();
      } else {
        this.searchBy.setValue('pid');
        this.pidPinPlaceholder = 'Type 9 digit PID';
        this.isCrownLand = false;
        this.pid.addValidators([Validators.required]);
        this.crownLandOwnerType.setValue(null);
        this.purchaseDate.enable();
      }

      this.filteredOwners = this.mapOwners(this.owners);
      this.selectedOwner = undefined;
      this.updateParcelOwners([]);
      this.pid.updateValueAndValidity();
    };

    if (formHasValues && this.isCrownLand !== null) {
      this.dialog
        .open(ParcelEntryConfirmationDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
        })
        .beforeClosed()
        .subscribe(async (result) => {
          if (result) {
            this.onReset();
            return changeParcelType();
          } else {
            const newParcelType = this.parcelType.getRawValue();

            const prevParcelType =
              newParcelType === this.PARCEL_OWNERSHIP_TYPES.CROWN
                ? this.PARCEL_OWNERSHIP_TYPES.FEE_SIMPLE
                : this.PARCEL_OWNERSHIP_TYPES.CROWN;

            this.parcelType.setValue(prevParcelType);
          }
        });
    } else {
      return changeParcelType();
    }
  }

  async attachFile(file: FileHandle, parcelUuid: string) {
    if (parcelUuid) {
      const mappedFiles = file.file;

      try {
        this.parcel.certificateOfTitle = await this.noticeOfIntentParcelService.attachCertificateOfTitle(
          this.fileId,
          parcelUuid,
          mappedFiles
        );
      } catch (e) {
        this.showVirusError = true;
        this.toastService.showErrorToast('Document upload failed');
        return;
      }
      this.showVirusError = false;
    }
  }

  async deleteFile($event: NoticeOfIntentDocumentDto) {
    if (this.isDraft) {
      this.dialog
        .open(RemoveFileConfirmationDialogComponent)
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            await this.noticeOfIntentDocumentService.deleteExternalFile($event.uuid);
            this.parcel.certificateOfTitle = undefined;
          }
        });
    } else {
      await this.noticeOfIntentDocumentService.deleteExternalFile($event.uuid);
      this.parcel.certificateOfTitle = undefined;
    }
  }

  async openFile(file: NoticeOfIntentDocumentDto) {
    const res = await this.noticeOfIntentDocumentService.openFile(file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  saveParcelProgress() {
    this.onSaveProgress.emit();
  }

  onAddNewOwner() {
    this.saveParcelProgress();
    const dialog = this.dialog.open(OwnerDialogComponent, {
      data: {
        fileId: this.fileId,
        submissionUuid: this.submissionUuid,
        parcelUuid: this.parcel.uuid,
        ownerService: this.noticeOfIntentOwnerService,
        documentService: this.noticeOfIntentDocumentService,
      },
    });
    dialog.afterClosed().subscribe((createdDto) => {
      if (createdDto) {
        this.onOwnersUpdated.emit();
        const updatedArray = [...this.parcel.owners, createdDto];
        this.updateParcelOwners(updatedArray);
        this.onOwnersUpdated.emit();
      }
    });
  }

  onAddNewGovernmentContact() {
    this.saveParcelProgress();
    const dialog = this.dialog.open(CrownOwnerDialogComponent, {
      data: {
        fileId: this.fileId,
        submissionUuid: this.submissionUuid,
        parcelUuid: this.parcel.uuid,
        ownerService: this.noticeOfIntentOwnerService,
      },
    });
    dialog.afterClosed().subscribe((createdDto) => {
      if (createdDto) {
        this.onOwnersUpdated.emit();
        const updatedArray = [...this.parcel.owners, createdDto];
        this.updateParcelOwners(updatedArray);
        this.selectedOwner = createdDto;
      }
    });
  }

  async onCrownOwnerSelected(event: Event, owner: NoticeOfIntentOwnerDto, isSelected: boolean) {
    this.selectedOwner = owner;
    const selectedOwners = [owner];
    this.updateParcelOwners(selectedOwners);

    setTimeout(() => {
      scrollToElement({ id: 'owner-info', center: false });
    });
  }

  onEditCrownOwner(owner: NoticeOfIntentOwnerDto) {
    this.saveParcelProgress();
    let dialog;
    dialog = this.dialog.open(CrownOwnerDialogComponent, {
      data: {
        isDraft: this.isDraft,
        parcelUuid: this.parcel.uuid,
        existingOwner: owner,
        submissionUuid: this.submissionUuid,
        ownerService: this.noticeOfIntentOwnerService,
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.parcelForm.patchValue(
          {
            isConfirmedByApplicant: false,
          },
          { emitEvent: false }
        );

        if (result.type === 'delete') {
          this.onOwnersDeleted.emit();
        }
        this.onOwnersUpdated.emit();
      }
    });
  }

  onOwnerEdited() {
    this.parcelForm.patchValue(
      {
        isConfirmedByApplicant: false,
      },
      { emitEvent: false }
    );
    this.onOwnersUpdated.emit();
  }

  private isOwnerInParcel(owner: NoticeOfIntentOwnerDto): boolean {
    return this.parcel.owners.some((existingOwner) => existingOwner.uuid === owner.uuid);
  }

  async onSelectOwner(event: Event, owner: NoticeOfIntentOwnerDto, isSelected: boolean) {
    if (!isSelected) {
      if (!this.isOwnerInParcel(owner)) {
        const selectedOwners = [...this.parcel.owners, owner];
        this.updateParcelOwners(selectedOwners);
      }
    } else {
      this.onOwnerRemoved(owner.uuid);
    }
  }

  async onOwnerRemoved(uuid: string) {
    const updatedArray = this.parcel.owners.filter((existingOwner) => existingOwner.uuid !== uuid);
    this.updateParcelOwners(updatedArray);
  }

  async onDeleteOwner() {
    this.onOwnersDeleted.emit();
  }

  mapOwners(owners: NoticeOfIntentOwnerDto[]) {
    return owners
      .filter((owner) => {
        if (this.isCrownLand) {
          return [OWNER_TYPE.CROWN].includes(owner.type.code);
        } else {
          return [OWNER_TYPE.INDIVIDUAL, OWNER_TYPE.ORGANIZATION].includes(owner.type.code);
        }
      })
      .map((owner) => {
        const isSelected = this.parcel.owners.some((parcelOwner) => parcelOwner.uuid === owner.uuid);
        return {
          ...owner,
          isSelected,
        };
      })
      .sort(this.noticeOfIntentOwnerService.sortOwners);
  }

  onTypeOwner($event: Event) {
    const element = $event.target as HTMLInputElement;
    this.filteredOwners = this.mapOwners(this.owners).filter((option) => {
      return option.displayName.toLowerCase().includes(element.value.toLowerCase());
    });
  }

  private setupForm() {
    this.parcelForm.patchValue({
      legalDescription: this.parcel.legalDescription,
      mapArea: this.parcel.mapAreaHectares,
      pid: this.parcel.pid,
      pin: this.parcel.pin,
      civicAddress: this.parcel.civicAddress,
      parcelType: this.parcel.ownershipTypeCode,
      isFarm: formatBooleanToString(this.parcel.isFarm),
      purchaseDate: this.parcel.purchasedDate ? new Date(this.parcel.purchasedDate) : null,
      isConfirmedByApplicant: this.enableUserSignOff ? this.parcel.isConfirmedByApplicant : false,
    });

    if (this.parcel.ownershipTypeCode) {
      this.parcelForm.enable();
      this.ownerInput.enable();
    }

    this.isCrownLand = this.parcelType.value
      ? this.parcelType.getRawValue() === this.PARCEL_OWNERSHIP_TYPES.CROWN
      : null;

    if (this.isCrownLand) {
      this.pidPin.disable();
      this.purchaseDate.disable();
      this.pid.removeValidators([Validators.required]);
      const pidValue = this.pid.getRawValue();
      this.isCertificateOfTitleRequired = !!pidValue && pidValue.length > 0;
      this.pidPinPlaceholder = '';
    } else {
      this.pidPinPlaceholder = 'Type 9 digit PID';
      this.isCertificateOfTitleRequired = true;
    }

    if (this.parcel.owners.length > 0 && this.isCrownLand) {
      this.ownerInput.disable();
    }

    if (this.showErrors) {
      this.parcelForm.markAllAsTouched();

      if (this.parcel.owners.length === 0) {
        this.ownerInput.setValidators([Validators.required]);
        this.ownerInput.setErrors({ required: true });
        this.ownerInput.markAllAsTouched();
      }
    }

    this.parcelForm.valueChanges.subscribe((formData) => {
      if (!this.parcelForm.dirty) {
        return;
      }

      if (this.isCrownLand && !this.searchBy.getRawValue()) {
        this.pidPin.disable({
          emitEvent: false,
        });
      } else {
        this.pidPin.enable({
          emitEvent: false,
        });
      }

      const pidValue = this.pid.getRawValue();
      if (this.isCrownLand) {
        this.isCertificateOfTitleRequired = !!pidValue && pidValue.length > 0;
      } else {
        this.isCertificateOfTitleRequired = true;
      }

      if (this.parcelForm.dirty && formData.isConfirmedByApplicant === this.parcel.isConfirmedByApplicant) {
        this.parcel.isConfirmedByApplicant = false;
        formData.isConfirmedByApplicant = false;

        this.parcelForm.patchValue(
          {
            isConfirmedByApplicant: false,
          },
          { emitEvent: false }
        );
      }

      return this.onFormGroupChange.emit({
        ...formData,
        uuid: this.parcel.uuid,
        isConfirmedByApplicant: formData.isConfirmedByApplicant!,
        purchaseDate: new Date(formData.purchaseDate?.valueOf()),
      });
    });
  }

  private updateParcelOwners(updatedArray: NoticeOfIntentOwnerDto[]) {
    if (updatedArray.length > 0) {
      this.ownerInput.clearValidators();
      this.ownerInput.updateValueAndValidity();
    } else if (updatedArray.length === 0 && this.showErrors) {
      this.ownerInput.markAllAsTouched();
      this.ownerInput.setValidators([Validators.required]);
      this.ownerInput.setErrors({ required: true });
    }

    this.parcelForm.patchValue(
      {
        isConfirmedByApplicant: false,
      },
      { emitEvent: false }
    );

    if (this.isCrownLand && updatedArray.length > 0) {
      this.ownerInput.disable();
    } else {
      this.ownerInput.enable();
    }

    this.parcel.owners = updatedArray;
    this.filteredOwners = this.mapOwners(this.owners);
    this.onFormGroupChange.emit({
      uuid: this.parcel.uuid,
      owners: updatedArray,
    });
  }

  onChangeSearchBy(value: string) {
    if (value === 'pid') {
      this.pidPinPlaceholder = 'Type 9 digit PID';
    } else {
      this.pidPinPlaceholder = 'Type PIN';
    }
  }
}
