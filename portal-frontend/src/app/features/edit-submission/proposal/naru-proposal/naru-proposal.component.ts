import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import {
  ApplicationSubmissionUpdateDto,
  NaruSubtypeDto,
} from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../services/code/code.service';
import { formatBooleanToYesNoString } from '../../../../shared/utils/boolean-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../soil-table/soil-table.component';
import { ChangeSubtypeConfirmationDialogComponent } from './change-subtype-confirmation-dialog/change-subtype-confirmation-dialog.component';

@Component({
  selector: 'app-naru-proposal',
  templateUrl: './naru-proposal.component.html',
  styleUrls: ['./naru-proposal.component.scss'],
})
export class NaruProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  previousSubtype: string | null = null;
  subtype = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  floorArea = new FormControl<string | null>(null, [Validators.required]);
  residenceNecessity = new FormControl<string | null>(null, [Validators.required]);
  locationRationale = new FormControl<string | null>(null, [Validators.required]);
  infrastructure = new FormControl<string | null>(null, [Validators.required]);
  existingStructures = new FormControl<string | null>(null, [Validators.required]);
  willImportFill = new FormControl<string | null>(null, [Validators.required]);
  fillType = new FormControl<string | null>(null, [Validators.required]);
  fillOrigin = new FormControl<string | null>(null, [Validators.required]);
  projectDurationAmount = new FormControl<string | null>(null, [Validators.required]);
  projectDurationUnit = new FormControl<string | null>(null, [Validators.required]);

  proposalMap: ApplicationDocumentDto[] = [];
  fillTableData: SoilTableData = {};

  form = new FormGroup({
    subtype: this.subtype,
    purpose: this.purpose,
    floorArea: this.floorArea,
    residenceNecessity: this.residenceNecessity,
    locationRationale: this.locationRationale,
    infrastructure: this.infrastructure,
    existingStructures: this.existingStructures,
    willImportFill: this.willImportFill,
    fillType: this.fillType,
    fillOrigin: this.fillOrigin,
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
  });

  private submissionUuid = '';
  naruSubtypes: NaruSubtypeDto[] = [];

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
    private codeService: CodeService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog
  ) {
    super(applicationDocumentService, dialog);
  }

  ngOnInit(): void {
    this.loadNaruSubtypes();
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.form.patchValue({
          subtype: applicationSubmission.naruSubtype?.code,
          existingStructures: applicationSubmission.naruExistingStructures,
          willImportFill: formatBooleanToYesNoString(applicationSubmission.naruWillImportFill),
          fillType: applicationSubmission.naruFillType,
          fillOrigin: applicationSubmission.naruFillOrigin,
          floorArea: applicationSubmission.naruFloorArea ? applicationSubmission.naruFloorArea.toString() : null,
          infrastructure: applicationSubmission.naruInfrastructure,
          locationRationale: applicationSubmission.naruLocationRationale,
          projectDurationAmount: applicationSubmission.naruProjectDurationAmount
            ? applicationSubmission.naruProjectDurationAmount.toString()
            : null,
          projectDurationUnit: applicationSubmission.naruProjectDurationUnit,
          purpose: applicationSubmission.naruPurpose,
          residenceNecessity: applicationSubmission.naruResidenceNecessity,
        });
        this.previousSubtype = applicationSubmission.naruSubtype?.code ?? null;

        if (applicationSubmission.naruWillImportFill !== null) {
          const willImportFill = applicationSubmission.naruWillImportFill ? 'true' : 'false';
          this.onChangeFill(willImportFill);
          this.form.patchValue({
            willImportFill,
          });
        }

        this.fillTableData = {
          volume: applicationSubmission.naruToPlaceVolume ?? undefined,
          area: applicationSubmission.naruToPlaceArea ?? undefined,
          maximumDepth: applicationSubmission.naruToPlaceMaximumDepth ?? undefined,
          averageDepth: applicationSubmission.naruToPlaceAverageDepth ?? undefined,
        };

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    });
  }

  async onSave() {
    await this.save();
  }

  onChangeSubtype($event: MatRadioChange) {
    if (this.previousSubtype) {
      this.dialog
        .open(ChangeSubtypeConfirmationDialogComponent)
        .beforeClosed()
        .subscribe((didConfirm) => {
          if (didConfirm) {
            this.previousSubtype = $event.value;
          } else {
            this.subtype.setValue(this.previousSubtype);
          }
        });
    } else {
      this.previousSubtype = $event.value;
    }
  }

  onChangeFill(value: string) {
    if (value === 'true') {
      this.projectDurationAmount.enable();
      this.projectDurationUnit.enable();
      this.fillOrigin.enable();
      this.fillType.enable();
    } else {
      this.projectDurationAmount.disable();
      this.projectDurationUnit.disable();
      this.fillOrigin.disable();
      this.fillType.disable();

      this.projectDurationAmount.setValue(null);
      this.projectDurationUnit.setValue(null);
      this.fillOrigin.setValue(null);
      this.fillType.setValue(null);
    }
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const {
        existingStructures,
        willImportFill,
        fillType,
        fillOrigin,
        floorArea,
        infrastructure,
        locationRationale,
        projectDurationAmount,
        projectDurationUnit,
        purpose,
        residenceNecessity,
        subtype,
      } = this.form.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        naruExistingStructures: existingStructures,
        naruWillImportFill: willImportFill !== undefined ? willImportFill === 'true' : null,
        naruFillType: fillType,
        naruFillOrigin: fillOrigin,
        naruToPlaceAverageDepth: this.fillTableData.averageDepth ?? null,
        naruToPlaceMaximumDepth: this.fillTableData.maximumDepth ?? null,
        naruToPlaceArea: this.fillTableData.area ?? null,
        naruToPlaceVolume: this.fillTableData.volume ?? null,
        naruFloorArea: floorArea ? parseFloat(floorArea) : null,
        naruInfrastructure: infrastructure,
        naruLocationRationale: locationRationale,
        naruProjectDurationAmount: projectDurationAmount ? parseFloat(projectDurationAmount) : null,
        naruProjectDurationUnit: projectDurationUnit,
        naruPurpose: purpose,
        naruResidenceNecessity: residenceNecessity,
        naruSubtypeCode: subtype,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  private async loadNaruSubtypes() {
    const subtypes = await this.codeService.loadCodes();
    this.naruSubtypes = subtypes.naruSubtypes;
  }
}
