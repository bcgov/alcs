import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../../services/application-owner/application-owner.service';
import {
  ApplicationParcelDto,
  PARCEL_OWNERSHIP_TYPE,
} from '../../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../../services/application-parcel/application-parcel.service';
import { ParcelService } from '../../../../../services/parcel/parcel.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { OWNER_TYPE } from '../../../../../shared/dto/owner.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { CrownOwnerDialogComponent } from '../../../../../shared/owner-dialogs/crown-owner-dialog/crown-owner-dialog.component';
import { OwnerDialogComponent } from '../../../../../shared/owner-dialogs/owner-dialog/owner-dialog.component';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { openFileInline } from '../../../../../shared/utils/file';
import { RemoveFileConfirmationDialogComponent } from '../../../alcs-edit-submission/remove-file-confirmation-dialog/remove-file-confirmation-dialog.component';
import { ParcelEntryConfirmationDialogComponent } from './parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { HttpErrorResponse } from '@angular/common/http';

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
  isConfirmedByApplicant: boolean;
  owners: ApplicationOwnerDto[];
}

@Component({
  selector: 'app-parcel-entry[parcel][fileId][submissionUuid]',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  @Input() parcel!: ApplicationParcelDto;
  @Input() fileId!: string;
  @Input() submissionUuid!: string;
  @Input() $owners: BehaviorSubject<ApplicationOwnerDto[]> = new BehaviorSubject<ApplicationOwnerDto[]>([]);

  @Input() enableOwners = true;
  @Input() enableCertificateOfTitleUpload = true;
  @Input() enableUserSignOff = true;
  @Input() enableAddNewOwner = true;
  @Input() showErrors = false;
  @Input() _disabled = false;
  @Input() isDraft = false;

  showHasVirusError = false;
  showVirusScanFailedError = false;
  showUnknownError = false;

  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();
  @Output() private onSaveProgress = new EventEmitter<void>();
  @Output() onOwnersUpdated = new EventEmitter<void>();
  @Output() onOwnersDeleted = new EventEmitter<void>();

  @ViewChild('ownerInfo') ownerInfo!: ElementRef<HTMLElement>;

  owners: ApplicationOwnerDto[] = [];
  filteredOwners: (ApplicationOwnerDto & { isSelected: boolean })[] = [];

  searchBy = new FormControl<string | null>(null);
  isCrownLand: boolean | null = null;
  isCertificateOfTitleRequired = true;
  isMobile = false;

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
    [Validators.required],
  );
  mapArea = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );
  pid = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
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
    [Validators.required],
  );
  isFarm = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );
  purchaseDate = new FormControl<any | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );
  isConfirmedByApplicant = new FormControl<boolean>(
    {
      disabled: true,
      value: false,
    },
    [Validators.requiredTrue],
  );
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
    isConfirmedByApplicant: this.isConfirmedByApplicant,
    searchBy: this.searchBy,
  });
  pidPinPlaceholder = '';
  selectedOwner?: ApplicationOwnerDto = undefined;

  ownerInput = new FormControl<string | null>({
    disabled: true,
    value: null,
  });

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;
  maxPurchasedDate = new Date();

  constructor(
    private parcelService: ParcelService,
    private applicationParcelService: ApplicationParcelService,
    public applicationOwnerService: ApplicationOwnerService,
    public applicationDocumentService: ApplicationDocumentService,
    private dialog: MatDialog,
    private toastService: ToastService,
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
    });
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  async onSearch() {
    let result;
    const searchValue = this.pidPin.getRawValue();
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
    const dirtyForm =
      this.legalDescription.value ||
      this.mapArea.value ||
      this.pid.value ||
      this.pin.value ||
      this.purchaseDate.value ||
      this.isFarm.value ||
      this.civicAddress.value ||
      this.parcel.owners.length > 0;

    this.parcelForm.enable();
    this.ownerInput.enable();

    const changeParcelType = () => {
      if ($event.value === this.PARCEL_OWNERSHIP_TYPES.CROWN) {
        this.searchBy.setValue(null);
        this.pidPinPlaceholder = '';
        this.isCrownLand = true;
        this.purchaseDate.disable();
        this.pid.removeValidators([Validators.required]);
      } else {
        this.searchBy.setValue('pid');
        this.pidPinPlaceholder = 'Type 9 digit PID';
        this.isCrownLand = false;
        this.pid.addValidators([Validators.required]);
        this.purchaseDate.enable();
      }

      this.filteredOwners = this.mapOwners(this.owners);
      this.selectedOwner = undefined;
      this.updateParcelOwners([]);
      this.pid.updateValueAndValidity();
    };

    if (dirtyForm && this.isCrownLand !== null) {
      this.dialog
        .open(ParcelEntryConfirmationDialogComponent, {
          panelClass: 'no-padding',
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
        this.parcel.certificateOfTitle = await this.applicationParcelService.attachCertificateOfTitle(
          this.fileId,
          parcelUuid,
          mappedFiles,
        );
        this.toastService.showSuccessToast('Document uploaded');
        this.showHasVirusError = false;
        this.showVirusScanFailedError = false;
        this.showUnknownError = false;
        return;
      } catch (err) {
        this.toastService.showErrorToast('Document upload failed');

        if (err instanceof HttpErrorResponse) {
          this.showHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
          this.showVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
        }
      }
    }
    this.showUnknownError = !this.showHasVirusError && !this.showVirusScanFailedError;
  }

  async deleteFile($event: ApplicationDocumentDto) {
    if (this.isDraft) {
      this.dialog
        .open(RemoveFileConfirmationDialogComponent)
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            await this.applicationDocumentService.deleteExternalFile($event.uuid);
            this.parcel.certificateOfTitle = undefined;
          }
        });
    } else {
      await this.applicationDocumentService.deleteExternalFile($event.uuid);
      this.parcel.certificateOfTitle = undefined;
    }
  }

  async openFile(file: ApplicationDocumentDto) {
    const res = await this.applicationDocumentService.openFile(file.uuid);
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
        ownerService: this.applicationOwnerService,
        documentService: this.applicationDocumentService,
      },
    });
    dialog.beforeClosed().subscribe((createdDto) => {
      if (createdDto) {
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
        ownerService: this.applicationOwnerService,
      },
    });
    dialog.afterClosed().subscribe((createdDto) => {
      if (createdDto) {
        const updatedArray = [...this.parcel.owners, createdDto];
        this.updateParcelOwners(updatedArray);
        this.onOwnersUpdated.emit();
      }
    });
  }

  private isOwnerInParcel(owner: ApplicationOwnerDto): boolean {
    return this.parcel.owners.some((existingOwner) => existingOwner.uuid === owner.uuid);
  }

  async onSelectOwner(event: Event, owner: ApplicationOwnerDto, isSelected: boolean) {
    if (!isSelected) {
      if (!this.isOwnerInParcel(owner)) {
        const selectedOwners = [...this.parcel.owners, owner];
        this.updateParcelOwners(selectedOwners);
      }
    } else {
      await this.onRemoveOwner(owner.uuid);
    }
  }

  async onCrownOwnerSelected(owner: ApplicationOwnerDto, isSelected: boolean) {
    this.selectedOwner = owner;
    const selectedOwners = [owner];
    this.updateParcelOwners(selectedOwners);

    setTimeout(() => {
      this.ownerInfo.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  onOwnerEdited(updatedOwner: ApplicationOwnerDto) {
    this.parcelForm.patchValue(
      {
        isConfirmedByApplicant: false,
      },
      { emitEvent: false },
    );
    const updatedOwners = this.parcel.owners.map((owner) => (owner.uuid === updatedOwner.uuid ? updatedOwner : owner));
    this.updateParcelOwners(updatedOwners);
    this.onOwnersUpdated.emit();
  }

  onEditCrownOwner(owner: ApplicationOwnerDto) {
    this.saveParcelProgress();
    let dialog;
    dialog = this.dialog.open(CrownOwnerDialogComponent, {
      data: {
        isDraft: this.isDraft,
        parcelUuid: this.parcel.uuid,
        existingOwner: owner,
        submissionUuid: this.submissionUuid,
        ownerService: this.applicationOwnerService,
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.parcelForm.patchValue(
          {
            isConfirmedByApplicant: false,
          },
          { emitEvent: false },
        );

        this.onOwnersUpdated.emit();
        if (result.type === 'delete') {
          this.onRemoveOwner(result.uuid);
        }
      }
    });
  }

  async onRemoveOwner(uuid: string) {
    const updatedArray = this.parcel.owners.filter((existingOwner) => existingOwner.uuid !== uuid);
    this.updateParcelOwners(updatedArray);
  }

  async onDeleteOwner() {
    this.onOwnersDeleted.emit();
  }

  mapOwners(owners: ApplicationOwnerDto[]) {
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
      .sort(this.sortOwners);
  }

  sortOwners(a: ApplicationOwnerDto, b: ApplicationOwnerDto) {
    if (a.displayName < b.displayName) {
      return -1;
    }
    if (a.displayName > b.displayName) {
      return 1;
    }
    return 0;
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
          { emitEvent: false },
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

  private updateParcelOwners(updatedArray: ApplicationOwnerDto[]) {
    if (updatedArray.length > 0) {
      this.ownerInput.clearValidators();
      this.ownerInput.updateValueAndValidity();
    } else if (updatedArray.length === 0 && this.showErrors) {
      this.ownerInput.markAllAsTouched();
      this.ownerInput.setValidators([Validators.required]);
      this.ownerInput.setErrors({ required: true });
    }

    if (this.isCrownLand && updatedArray.length > 0) {
      this.ownerInput.disable();
    } else {
      this.ownerInput.enable();
    }

    this.parcelForm.patchValue(
      {
        isConfirmedByApplicant: false,
      },
      { emitEvent: false },
    );

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

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
