import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  APPLICATION_PARCEL_DOCUMENT,
  ApplicationParcelDto,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDocumentDto, ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { ParcelEntryFormData } from './parcel-entry/parcel-entry.component';

@Component({
  selector: 'app-parcel-details',
  templateUrl: './parcel-details.component.html',
  styleUrls: ['./parcel-details.component.scss'],
})
export class ParcelDetailsComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;

  $destroy = new Subject<void>();

  certificateOfTitleDocument: ApplicationDocumentDto[] = [];
  documentTypes = APPLICATION_PARCEL_DOCUMENT;
  private fileId!: string;

  parcels: ApplicationParcelDto[] = [];

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private applicationParcelService: ApplicationParcelService,
    private toastService: ToastService
  ) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.loadParcels();
      }
    });
  }

  private async loadParcels() {
    this.parcels = (await this.applicationParcelService.fetchByFileId(this.fileId)) || [];
    if (!this.parcels || this.parcels.length === 0) {
      await this.onAddParcel();
    }
  }

  async onAddParcel() {
    const parcel = await this.applicationParcelService.create(this.fileId);

    if (parcel) {
      this.parcels.push({
        uuid: parcel!.uuid,
        documents: [] as ApplicationDocumentDto[],
      } as ApplicationParcelDto);
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

    parcel.pid = formData.pid;
    parcel.pin = formData.pin;
    parcel.legalDescription = formData.legalDescription;
    parcel.mapAreaHectares = formData.mapArea;
    parcel.ownershipTypeCode = formData.parcelType;
    parcel.isFarm = this.parseStringToBoolean(formData.isFarm);
    parcel.purchasedDate = formData.purchaseDate?.getTime();
  }

  async saveProgress() {
    for (const parcel of this.parcels) {
      console.log('saveProgress', parcel);
      await this.applicationParcelService.update(parcel.uuid, {
        pid: parcel.pid?.toString(),
        pin: parcel.pin?.toString(),
        legalDescription: parcel.legalDescription,
        isFarm: parcel.isFarm,
        purchasedDate: parcel.purchasedDate,
        mapAreaHectares: parcel.mapAreaHectares,
        ownershipTypeCode: parcel.ownershipTypeCode,
        isConfirmedByApplicant: parcel.isConfirmedByApplicant,
      });
    }
  }

  async onSave() {
    await this.saveProgress();
  }

  async onSaveExit() {
    if (this.fileId) {
      await this.saveProgress();
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  async loadApplication(fileId: string) {
    const application = await this.applicationService.getByFileId(fileId);
    this.$application.next(application);
  }

  async attachFile(files: FileHandle[], documentType: APPLICATION_PARCEL_DOCUMENT, parcelUuid: string) {
    if (this.fileId) {
      const mappedFiles = files.map((file) => file.file);
      await this.applicationParcelService.attachExternalFile(parcelUuid, mappedFiles, documentType);
      await this.loadParcels();
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    if (this.fileId) {
      await this.applicationParcelService.deleteExternalFile($event.uuid);
      await this.loadParcels();
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationParcelService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  // TODO move to utils
  private parseStringToBoolean(val?: string | null) {
    switch (val) {
      case 'true':
        return true;
      case 'false':
        return false;
      case null:
        return null;
      default:
        return undefined;
    }
  }
}
