import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { PARCEL_TYPE } from '../../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../../services/application-parcel/application-parcel.service';
import {
  ApplicationSubmissionUpdateDto,
  ProposedLot,
} from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

type FormProposedLot = { type: 'Lot' | 'Road Dedication' | null; size: string | null };

@Component({
  selector: 'app-subd-proposal',
  templateUrl: './subd-proposal.component.html',
  styleUrls: ['./subd-proposal.component.scss'],
})
export class SubdProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  homesiteSeverance: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  lotsProposed = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  suitability = new FormControl<string | null>(null, [Validators.required]);
  agriculturalSupport = new FormControl<string | null>(null, [Validators.required]);
  isHomeSiteSeverance = new FormControl<string | null>(null, [Validators.required]);

  totalTargetAcres = '0';
  totalAcres = '0';
  proposedLots: FormProposedLot[] = [];
  lotsSource = new MatTableDataSource(this.proposedLots);
  displayedColumns = ['index', 'type', 'size'];

  form = new FormGroup({
    lotsProposed: this.lotsProposed,
    purpose: this.purpose,
    suitability: this.suitability,
    agriculturalSupport: this.agriculturalSupport,
    isHomeSiteSeverance: this.isHomeSiteSeverance,
  });
  lotsForm = new FormGroup({} as any);
  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private parcelService: ApplicationParcelService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog
  ) {
    super(applicationDocumentService, dialog);
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
          purpose: applicationSubmission.purpose,
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

        const newForm = new FormGroup({});
        for (const [index, lot] of applicationSubmission.subdProposedLots.entries()) {
          newForm.addControl(`${index}-type`, new FormControl(lot.type, [Validators.required]));
          newForm.addControl(`${index}-size`, new FormControl(lot.size, [Validators.required]));
        }
        this.lotsForm = newForm;

        this.calculateLotSize();

        if (this.showErrors) {
          this.form.markAllAsTouched();
          this.lotsForm.markAllAsTouched();
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

  protected async save() {
    if (this.fileId && (this.form.dirty || this.lotsForm.dirty)) {
      const purpose = this.purpose.getRawValue();
      const subdSuitability = this.suitability.getRawValue();
      const subdAgricultureSupport = this.agriculturalSupport.getRawValue();
      const subdIsHomeSiteSeverance = this.isHomeSiteSeverance.getRawValue();

      const updatedStructures: ProposedLot[] = [];
      for (const [index, lot] of this.proposedLots.entries()) {
        const lotType = this.lotsForm.controls[`${index}-type`].value;
        const lotSize = this.lotsForm.controls[`${index}-size`].value;
        updatedStructures.push({
          type: lotType,
          size: lotSize ? parseFloat(lotSize) : null,
        });
      }

      const updateDto: ApplicationSubmissionUpdateDto = {
        purpose,
        subdSuitability,
        subdAgricultureSupport,
        subdIsHomeSiteSeverance: subdIsHomeSiteSeverance !== null ? subdIsHomeSiteSeverance === 'true' : null,
        subdProposedLots: updatedStructures,
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeLotCount(event: Event) {
    const targetString = (event.target as HTMLInputElement).value;
    const targetCount = parseInt(targetString);

    for (let index = this.proposedLots.length; index > targetCount; index--) {
      this.lotsForm.removeControl(`${index}-type`);
      this.lotsForm.removeControl(`${index}-size`);
    }

    this.proposedLots = this.proposedLots.slice(0, targetCount);
    while (this.proposedLots.length < targetCount) {
      this.proposedLots.push({
        size: '0',
        type: null,
      });

      const index = this.proposedLots.length - 1;
      this.lotsForm.addControl(`${index}-type`, new FormControl(null, [Validators.required]));
      this.lotsForm.addControl(`${index}-size`, new FormControl(null, [Validators.required]));
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
