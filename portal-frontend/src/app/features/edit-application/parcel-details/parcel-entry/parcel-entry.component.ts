import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../../../services/application-document/application-document.dto';
import { ApplicationOwnerDto } from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { ApplicationParcelDto } from '../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ParcelService } from '../../../../services/parcel/parcel.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../shared/utils/boolean-helper';
import { ApplicationOwnerDialogComponent } from '../application-owner-dialog/application-owner-dialog.component';
import { ApplicationOwnersDialogComponent } from '../application-owners-dialog/application-owners-dialog.component';

export interface ParcelEntryFormData {
  uuid: string;
  pidPin: string | undefined | null;
  legalDescription: string | undefined | null;
  mapArea: string | undefined | null;
  pin: string | undefined | null;
  pid: string | undefined | null;
  parcelType: string | undefined | null;
  isFarm: string | undefined | null;
  purchaseDate?: Date | null;
  isConfirmedByApplicant: boolean;
  owners: ApplicationOwnerDto[];
}

@Component({
  selector: 'app-parcel-entry[parcel][fileId]',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  @Input() parcel!: ApplicationParcelDto;
  @Input() fileId!: string;
  @Input() $owners: BehaviorSubject<ApplicationOwnerDto[]> = new BehaviorSubject<ApplicationOwnerDto[]>([]);

  @Input() enableOwners = true;
  @Input() enableCertificateOfTitleUpload = true;
  @Input() enableUserSignOff = true;
  @Input() enableAddNewOwner = true;
  @Input() showErrors = false;
  @Input() _disabled = false;

  @Input()
  public set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.onFormDisabled();
  }

  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();
  @Output() private onFilesUpdated = new EventEmitter<void>();
  @Output() private onSaveProgress = new EventEmitter<void>();
  @Output() onOwnersUpdated = new EventEmitter<void>();

  owners: ApplicationOwnerDto[] = [];
  filteredOwners: (ApplicationOwnerDto & { isSelected: boolean })[] = [];

  pidPin = new FormControl<string>('');
  legalDescription = new FormControl<string | null>(null, [Validators.required]);
  mapArea = new FormControl<string | null>(null, [Validators.required]);
  pid = new FormControl<string | null>(null, [Validators.required]);
  pin = new FormControl<string | null>(null);
  parcelType = new FormControl<string | null>(null, [Validators.required]);
  isFarm = new FormControl<string | null>(null);
  purchaseDate = new FormControl<any | null>(null, [Validators.required]);
  isConfirmedByApplicant = new FormControl<boolean>(false);
  parcelForm = new FormGroup({
    pidPin: this.pidPin,
    legalDescription: this.legalDescription,
    mapArea: this.mapArea,
    pin: this.pin,
    pid: this.pid,
    parcelType: this.parcelType,
    isFarm: this.isFarm,
    purchaseDate: this.purchaseDate,
    isConfirmedByApplicant: this.isConfirmedByApplicant,
  });

  ownerInput = new FormControl<string | null>(null);

  documentTypes = DOCUMENT;
  maxPurchasedDate = new Date();

  constructor(
    private parcelService: ParcelService,
    private applicationParcelService: ApplicationParcelService,
    private applicationOwnerService: ApplicationOwnerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupForm();

    this.$owners.subscribe((owners) => {
      this.owners = owners;
      this.filteredOwners = this.mapOwners(owners);
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
    const result = await this.parcelService.getByPidPin(this.pidPin.getRawValue()!);
    this.onReset();
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

    this.emitFormChangeOnSearchActions();
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
    if ($event.value === 'CRWN') {
      this.purchaseDate.reset();
      this.purchaseDate.disable();
    } else {
      this.purchaseDate.enable();
    }
  }

  async attachFile(file: FileHandle, documentType: DOCUMENT, parcelUuid: string) {
    if (parcelUuid) {
      const mappedFiles = file.file;
      await this.applicationParcelService.attachExternalFile(parcelUuid, mappedFiles);
      this.onFilesUpdated.emit();
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationParcelService.deleteExternalFile($event.uuid);
    this.onFilesUpdated.emit();
  }

  async openFile(uuid: string) {
    const res = await this.applicationParcelService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  async beforeFileUploadOpened() {
    this.onSaveProgress.emit();
  }

  onAddNewOwner() {
    const dialog = this.dialog.open(ApplicationOwnerDialogComponent, {
      data: {
        fileId: this.fileId,
        parcelUuid: this.parcel.uuid,
      },
    });
    dialog.beforeClosed().subscribe((createdDto) => {
      if (createdDto) {
        this.onOwnersUpdated.emit();
        const updatedArray = [...this.parcel.owners, createdDto];
        this.updateParcelOwners(updatedArray);
      }
    });
  }

  async onSelectOwner(owner: ApplicationOwnerDto, isSelected: boolean) {
    if (isSelected) {
      const updatedArray = this.parcel.owners.filter((existingOwner) => existingOwner.uuid !== owner.uuid);
      this.updateParcelOwners(updatedArray);
    } else {
      const selectedOwners = [...this.parcel.owners, owner];
      this.updateParcelOwners(selectedOwners);
    }
  }

  async onOwnerRemoved(uuid: string) {
    const updatedArray = this.parcel.owners.filter((existingOwner) => existingOwner.uuid !== uuid);
    this.updateParcelOwners(updatedArray);
  }

  mapOwners(owners: ApplicationOwnerDto[]) {
    return owners
      .map((owner) => {
        const isSelected = this.parcel.owners.some((parcelOwner) => parcelOwner.uuid === owner.uuid);
        return {
          ...owner,
          isSelected,
        };
      })
      .sort(this.applicationOwnerService.sortOwners);
  }

  onTypeOwner($event: Event) {
    const element = $event.target as HTMLInputElement;
    this.filteredOwners = this.mapOwners(this.owners).filter((option) => {
      return option.displayName.toLowerCase().includes(element.value.toLowerCase());
    });
  }

  onSeeAllOwners() {
    this.dialog
      .open(ApplicationOwnersDialogComponent, {
        data: {
          owners: this.owners,
          fileId: this.fileId,
        },
      })
      .beforeClosed()
      .subscribe((isDirty) => {
        if (isDirty) {
          this.onOwnersUpdated.emit();
        }
      });
  }

  private setupForm() {
    this.parcelForm.valueChanges.subscribe((formData) => {
      if (!this.parcelForm.dirty) {
        return;
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

    this.parcelForm.patchValue({
      legalDescription: this.parcel.legalDescription,
      mapArea: this.parcel.mapAreaHectares,
      pid: this.parcel.pid,
      pin: this.parcel.pin,
      parcelType: this.parcel.ownershipTypeCode,
      isFarm: formatBooleanToString(this.parcel.isFarm),
      purchaseDate: this.parcel.purchasedDate ? new Date(this.parcel.purchasedDate) : null,
      isConfirmedByApplicant: this.enableUserSignOff ? this.parcel.isConfirmedByApplicant : false,
    });

    if (this.showErrors) {
      this.parcelForm.markAllAsTouched();

      if (this.parcel.owners.length === 0) {
        this.ownerInput.setValidators([Validators.required]);
        this.ownerInput.setErrors({ required: true });
        this.ownerInput.markAllAsTouched();
      }
    }
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
    this.parcel.owners = updatedArray;
    this.filteredOwners = this.mapOwners(this.owners);
    this.onFormGroupChange.emit({
      uuid: this.parcel.uuid,
      owners: updatedArray,
    });
  }

  private onFormDisabled() {
    if (this._disabled) {
      this.parcelForm.disable();
    } else {
      this.parcelForm.enable();
    }
  }
}
