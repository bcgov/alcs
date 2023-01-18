import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  APPLICATION_DOCUMENT,
  ApplicationDocumentDto,
  ApplicationDto,
} from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ParcelDto } from '../../../services/parcel/parcel.dto';
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
  documentTypes = APPLICATION_DOCUMENT;
  private fileId: string | undefined;

  parcels: ParcelDto[] = [];

  constructor(private applicationService: ApplicationService, private router: Router) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.certificateOfTitleDocument = application.documents.filter(
          (document) => document.type === APPLICATION_DOCUMENT.CERTIFICATE_OF_TILE
        );
      }
    });

    this.loadParcels();
  }

  private async loadParcels() {
    this.parcels = [
      {
        uuid: '111-aaaa-bbb',
        PID: '100111222',
        PIN: '133444555',
        legalDescription: 'This is a legal description',
        mapAreaHectares: '10',
        purchasedDate: Date.now(),
        isFarm: false,
        owners: [
          {
            type: 'individual',
            firstName: 'First',
            lastName: 'Owner',
            phoneNumber: '1111111111',
            email: 'someEmail.com',
          },
          {
            type: 'individual',
            firstName: 'Second',
            lastName: 'Owner',
            phoneNumber: '2222222222',
            email: 'someEmail2.com',
          },
        ],
      },
      {
        uuid: '222-aaaa-bbb',
        PID: '200111222',
        PIN: '133444555',
        legalDescription: 'This is a legal description 2',
        mapAreaHectares: '10',
        purchasedDate: Date.now(),
        isFarm: false,
        owners: [
          {
            type: 'individual',
            firstName: 'First',
            lastName: 'Owner',
            phoneNumber: '1111111111',
            email: 'someEmail.com',
          },
          {
            type: 'individual',
            firstName: 'Second',
            lastName: 'Owner',
            phoneNumber: '2222222222',
            email: 'someEmail2.com',
          },
        ],
      },
    ];
  }

  async onAddParcel() {
    /*
    call portal api to create a new parcel with uuid
    use uuid to push into array
    */
    this.parcels.push({
      uuid: '333-aaaa-bbb',
      PID: undefined,
      PIN: undefined,
      legalDescription: undefined,
      mapAreaHectares: undefined,
      purchasedDate: undefined,
      isFarm: undefined,
      owners: []
    });
  }

  async onParcelFormChange(formData: Partial<ParcelEntryFormData>) {
    const ind = this.parcels.findIndex((e) => e.uuid === formData.uuid);

    this.parcels[ind].PID = formData.pid;
    this.parcels[ind].PID = formData.pin;
    this.parcels[ind].legalDescription = formData.legalDescription;
    this.parcels[ind].mapAreaHectares = formData.mapArea;
  }

  async saveProgress() {
    console.log('saveProgress', this.parcels);
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

  async attachFile(files: FileHandle[], documentType: APPLICATION_DOCUMENT) {
    if (this.fileId) {
      const mappedFiles = files.map((file) => file.file);
      await this.applicationService.attachExternalFile(this.fileId, mappedFiles, documentType);
      await this.loadApplication(this.fileId);
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    if (this.fileId) {
      await this.applicationService.deleteExternalFile($event.uuid);
      await this.loadApplication(this.fileId);
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
