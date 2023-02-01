import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationOwnerDetailedDto } from '../../../services/application-owner/application-owner.dto';
import {
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
  PARCEL_TYPE,
} from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { parseStringToBoolean } from '../../../shared/utils/string-helper';
import { DeleteParcelDialogComponent } from '../parcel-details/delete-parcel/delete-parcel-dialog.component';
import { ParcelEntryFormData } from '../parcel-details/parcel-entry/parcel-entry.component';

@Component({
  selector: 'app-other-parcels',
  templateUrl: './other-parcels.component.html',
  styleUrls: ['./other-parcels.component.scss'],
})
export class OtherParcelsComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
  fileId: string = '';
  owners: ApplicationOwnerDetailedDto[] = [];
  PARCEL_TYPE = PARCEL_TYPE;

  $destroy = new Subject<void>();

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
        this.fileId = application.fileNumber;
        this.owners = application.owners.map((o) => ({
          ...o,
          parcels: o.parcels.filter((p) => p.parcelType === PARCEL_TYPE.OTHER),
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onParcelFormChange(formData: Partial<ParcelEntryFormData>) {
    const parcel = this.owners.flatMap((o) => o.parcels).find((e) => e.uuid === formData.uuid);
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
    for (const parcel of this.owners.flatMap((o) => o.parcels)) {
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
      });
    }

    await this.applicationParcelService.update(parcelsToUpdate);
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

  async onAddParcel(ownerId: string) {
    const parcel = await this.applicationParcelService.create(this.fileId, PARCEL_TYPE.OTHER, ownerId);

    if (parcel) {
      const owner = this.owners.find((o) => o.uuid === ownerId);
      owner?.parcels.push({
        uuid: parcel!.uuid,
        parcelType: PARCEL_TYPE.OTHER,
        documents: [] as ApplicationDocumentDto[],
      } as ApplicationParcelDto);
    } else {
      this.toastService.showErrorToast('Error adding new parcel. Please refresh page and try again.');
    }
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
}
