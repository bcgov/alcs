import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
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
  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();
  @Output() private onFilesUpdated = new EventEmitter<void>();
  @Output() private onSaveProgress = new EventEmitter<void>();
  @Output() onOwnersUpdated = new EventEmitter<void>();

  @Input()
  parcel!: ApplicationParcelDto;

  @Input()
  fileId!: string;

  @Input()
  $owners: BehaviorSubject<ApplicationOwnerDto[]> = new BehaviorSubject<ApplicationOwnerDto[]>([]);
  owners: ApplicationOwnerDto[] = [];
  filteredOwners: (ApplicationOwnerDto & { isSelected: boolean })[] = [];

  @Input()
  enableOwners: boolean = true;
  @Input()
  enableCertificateOfTitleUpload: boolean = true;
  @Input()
  enableUserSignOff: boolean = true;

  pidPin = new FormControl<string>('');
  legalDescription = new FormControl<string | null>(null);
  mapArea = new FormControl<string | null>(null);
  pin = new FormControl<string | null>(null);
  pid = new FormControl<string | null>(null);
  parcelType = new FormControl<string | null>(null);
  isFarm = new FormControl<string | null>(null);
  purchaseDate = new FormControl<any | null>(null);
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

  documentTypes = DOCUMENT;

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
  }

  async onSearch() {
    const result = await this.parcelService.getByPidPin(this.pidPin.getRawValue()!);
    if (result) {
      this.legalDescription.setValue(result.legalDescription);
      this.mapArea.setValue(result.mapArea);
      if (result.pin) {
        this.pin.setValue(result.pin);
      }
    }
  }

  onReset() {
    this.parcelForm.reset();
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
        this.parcel.owners = updatedArray;
        this.onFormGroupChange.emit({
          uuid: this.parcel.uuid,
          owners: updatedArray,
        });
      }
    });
  }

  async onSelectOwner(owner: ApplicationOwnerDto, isSelected: boolean) {
    if (isSelected) {
      const updatedArray = this.parcel.owners.filter((existingOwner) => existingOwner.uuid !== owner.uuid);
      this.parcel.owners = updatedArray;
      this.onFormGroupChange.emit({
        uuid: this.parcel.uuid,
        owners: updatedArray,
      });
    } else {
      const updatedArray = [...this.parcel.owners, owner];
      this.parcel.owners = updatedArray;
      this.onFormGroupChange.emit({
        uuid: this.parcel.uuid,
        owners: updatedArray,
      });
    }
  }

  async onOwnerRemoved(uuid: string) {
    const updatedArray = this.parcel.owners.filter((existingOwner) => existingOwner.uuid !== uuid);
    this.parcel.owners = updatedArray;
    this.onFormGroupChange.emit({
      uuid: this.parcel.uuid,
      owners: updatedArray,
    });
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
}
