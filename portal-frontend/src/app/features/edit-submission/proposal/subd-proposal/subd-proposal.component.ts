import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BehaviorSubject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { PARCEL_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionUpdateDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { RemoveFileConfirmationDialogComponent } from '../../../alcs-edit-submission/remove-file-confirmation-dialog/remove-file-confirmation-dialog.component';
import { EditApplicationSteps } from '../../edit-submission.component';
import { StepComponent } from '../../step.partial';

type ProposedLot = { type: 'Lot' | 'Road Dedication' | null; size: string | null };

@Component({
  selector: 'app-subd-proposal',
  templateUrl: './subd-proposal.component.html',
  styleUrls: ['./subd-proposal.component.scss'],
})
export class SubdProposalComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;

  DOCUMENT = DOCUMENT_TYPE;

  homesiteSeverance: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  lotsProposed = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  suitability = new FormControl<string | null>(null, [Validators.required]);
  agriculturalSupport = new FormControl<string | null>(null, [Validators.required]);
  isHomeSiteSeverance = new FormControl<string | null>(null, [Validators.required]);

  fieldsAddsUp = false;
  totalTargetAcres = '0';
  totalAcres = '0';
  proposedLots: ProposedLot[] = [];
  lotsSource = new MatTableDataSource(this.proposedLots);
  displayedColumns = ['index', 'type', 'size'];

  form = new FormGroup({
    lotsProposed: this.lotsProposed,
    purpose: this.purpose,
    suitability: this.suitability,
    agriculturalSupport: this.agriculturalSupport,
    isHomeSiteSeverance: this.isHomeSiteSeverance,
  });
  private fileId = '';
  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    private parcelService: ApplicationParcelService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        let isHomeSiteSeverance = null;
        if (applicationSubmission.subdIsHomeSiteSeverance !== null) {
          isHomeSiteSeverance = applicationSubmission.subdIsHomeSiteSeverance ? 'true' : 'false';
        }

        this.form.patchValue({
          purpose: applicationSubmission.subdPurpose,
          suitability: applicationSubmission.subdSuitability,
          agriculturalSupport: applicationSubmission.subdAgricultureSupport,
          lotsProposed: applicationSubmission.subdProposedLots.length.toString(10),
          isHomeSiteSeverance,
        });
        this.proposedLots = applicationSubmission.subdProposedLots.map((lot) => ({
          ...lot,
          size: lot.size ? lot.size.toString(10) : null,
        }));
        this.lotsSource = new MatTableDataSource(this.proposedLots);
        this.calculateLotSize();

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }

        this.loadParcels(this.submissionUuid);
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.homesiteSeverance = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.HOMESITE_SEVERANCE);
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    });
  }

  async onSave() {
    await this.save();
  }

  async attachFile(file: FileHandle, documentType: DOCUMENT_TYPE) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;
      await this.applicationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async onDeleteFile($event: ApplicationDocumentDto) {
    if (this.draftMode) {
      this.dialog
        .open(RemoveFileConfirmationDialogComponent)
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            this.deleteFile($event);
          }
        });
    } else {
      await this.deleteFile($event);
    }
  }

  private async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationDocumentService.deleteExternalFile($event.uuid);
    if (this.fileId) {
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private async save() {
    if (this.fileId) {
      const subdPurpose = this.purpose.getRawValue();
      const subdSuitability = this.suitability.getRawValue();
      const subdAgricultureSupport = this.agriculturalSupport.getRawValue();
      const subdIsHomeSiteSeverance = this.isHomeSiteSeverance.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        subdPurpose,
        subdSuitability,
        subdAgricultureSupport,
        subdIsHomeSiteSeverance: subdIsHomeSiteSeverance !== null ? subdIsHomeSiteSeverance === 'true' : null,
        subdProposedLots: this.proposedLots.map((lot) => ({
          ...lot,
          size: lot.size ? parseFloat(lot.size) : null,
        })),
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeLotCount(event: Event) {
    const targetString = (event.target as HTMLInputElement).value;
    const targetCount = parseInt(targetString);

    this.proposedLots = this.proposedLots.slice(0, targetCount);
    while (this.proposedLots.length < targetCount) {
      this.proposedLots.push({
        size: '0',
        type: null,
      });
    }
    this.lotsSource = new MatTableDataSource(this.proposedLots);
    this.calculateLotSize();
  }

  onChangeLotSize() {
    this.calculateLotSize();
  }

  onChangeLotType(i: number, value: 'Lot' | 'Road Dedication') {
    this.proposedLots[i].type = value;
  }

  private calculateLotSize() {
    this.totalAcres = this.proposedLots
      .reduce((total, lot) => total + (lot.size !== null ? parseFloat(lot.size) : 0), 0)
      .toFixed(2);
  }

  private async loadParcels(submissionUuid: string) {
    const parcels = await this.parcelService.fetchBySubmissionUuid(submissionUuid);
    if (parcels) {
      this.totalTargetAcres = parcels
        .filter((parcel) => parcel.parcelType === PARCEL_TYPE.APPLICATION)
        .reduce((total, parcel) => total + (parcel.mapAreaHectares ? parseFloat(parcel.mapAreaHectares) : 0), 0)
        .toFixed(2);
    }
  }
}
