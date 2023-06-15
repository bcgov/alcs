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
import { ApplicationSubmissionUpdateDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { formatBooleanToYesNoString } from '../../../../shared/utils/boolean-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
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
  toPlaceVolume = new FormControl<string | null>(null, [Validators.required]);
  toPlaceArea = new FormControl<string | null>(null, [Validators.required]);
  toPlaceMaximumDepth = new FormControl<string | null>(null, [Validators.required]);
  toPlaceAverageDepth = new FormControl<string | null>(null, [Validators.required]);

  proposalMap: ApplicationDocumentDto[] = [];

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
    toPlaceVolume: this.toPlaceVolume,
    toPlaceArea: this.toPlaceArea,
    toPlaceMaximumDepth: this.toPlaceMaximumDepth,
    toPlaceAverageDepth: this.toPlaceAverageDepth,
  });

  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
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

        this.form.patchValue({
          subtype: applicationSubmission.naruSubtype,
          existingStructures: applicationSubmission.naruExistingStructures,
          willImportFill: formatBooleanToYesNoString(applicationSubmission.naruWillImportFill),
          fillType: applicationSubmission.naruFillType,
          fillOrigin: applicationSubmission.naruFillOrigin,
          toPlaceAverageDepth: applicationSubmission.naruToPlaceAverageDepth
            ? applicationSubmission.naruToPlaceAverageDepth.toString()
            : null,
          toPlaceMaximumDepth: applicationSubmission.naruToPlaceMaximumDepth
            ? applicationSubmission.naruToPlaceMaximumDepth.toString()
            : null,
          toPlaceArea: applicationSubmission.naruToPlaceArea ? applicationSubmission.naruToPlaceArea.toString() : null,
          floorArea: applicationSubmission.naruFloorArea ? applicationSubmission.naruFloorArea.toString() : null,
          toPlaceVolume: applicationSubmission.naruToPlaceVolume
            ? applicationSubmission.naruToPlaceVolume.toString()
            : null,
          infrastructure: applicationSubmission.naruInfrastructure,
          locationRationale: applicationSubmission.naruLocationRationale,
          projectDurationAmount: applicationSubmission.naruProjectDurationAmount
            ? applicationSubmission.naruProjectDurationAmount.toString()
            : null,
          projectDurationUnit: applicationSubmission.naruProjectDurationUnit,
          purpose: applicationSubmission.naruPurpose,
          residenceNecessity: applicationSubmission.naruResidenceNecessity,
        });
        this.previousSubtype = applicationSubmission.naruSubtype;

        if (applicationSubmission.naruWillImportFill) {
          this.onChangeFill('true');
        }

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
      this.toPlaceArea.enable();
      this.toPlaceAverageDepth.enable();
      this.toPlaceMaximumDepth.enable();
      this.toPlaceVolume.enable();
      this.projectDurationAmount.enable();
      this.projectDurationUnit.enable();
      this.fillOrigin.enable();
      this.fillType.enable();
    } else {
      this.toPlaceArea.disable();
      this.toPlaceAverageDepth.disable();
      this.toPlaceMaximumDepth.disable();
      this.toPlaceVolume.disable();
      this.projectDurationAmount.disable();
      this.projectDurationUnit.disable();
      this.fillOrigin.disable();
      this.fillType.disable();

      this.toPlaceArea.setValue(null);
      this.toPlaceAverageDepth.setValue(null);
      this.toPlaceMaximumDepth.setValue(null);
      this.toPlaceVolume.setValue(null);
      this.projectDurationAmount.setValue(null);
      this.projectDurationUnit.setValue(null);
      this.fillOrigin.setValue(null);
      this.fillType.setValue(null);
    }
  }

  protected async save() {
    if (this.fileId) {
      const {
        existingStructures,
        willImportFill,
        fillType,
        fillOrigin,
        toPlaceAverageDepth,
        toPlaceMaximumDepth,
        toPlaceArea,
        floorArea,
        toPlaceVolume,
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
        naruWillImportFill: willImportFill !== null ? willImportFill === 'yes' : null,
        naruFillType: fillType,
        naruFillOrigin: fillOrigin,
        naruToPlaceAverageDepth: toPlaceAverageDepth ? parseFloat(toPlaceAverageDepth) : null,
        naruToPlaceMaximumDepth: toPlaceMaximumDepth ? parseFloat(toPlaceMaximumDepth) : null,
        naruToPlaceArea: toPlaceArea ? parseFloat(toPlaceArea) : null,
        naruFloorArea: floorArea ? parseFloat(floorArea) : null,
        naruToPlaceVolume: toPlaceVolume ? parseFloat(toPlaceVolume) : null,
        naruInfrastructure: infrastructure,
        naruLocationRationale: locationRationale,
        naruProjectDurationAmount: projectDurationAmount ? parseFloat(projectDurationAmount) : null,
        naruProjectDurationUnit: projectDurationUnit,
        naruPurpose: purpose,
        naruResidenceNecessity: residenceNecessity,
        naruSubtype: subtype,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }
}
