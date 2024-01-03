import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import {
  ApplicationSubmissionUpdateDto,
  NaruSubtypeDto,
} from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../../services/code/code.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToYesNoString } from '../../../../../shared/utils/boolean-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { ChangeSubtypeConfirmationDialogComponent } from './change-subtype-confirmation-dialog/change-subtype-confirmation-dialog.component';

@Component({
  selector: 'app-naru-proposal',
  templateUrl: './naru-proposal.component.html',
  styleUrls: ['./naru-proposal.component.scss'],
})
export class NaruProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  showProposalMapVirus = false;

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
  projectDuration = new FormControl<string | null>(null, [Validators.required]);
  sleepingUnits = new FormControl<string | null>(null, [Validators.required]);
  agriTourism = new FormControl<string | null>(null, [Validators.required]);

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
    projectDuration: this.projectDuration,
    sleepingUnits: this.sleepingUnits,
    agriTourism: this.agriTourism,
  });

  private submissionUuid = '';
  naruSubtypes: NaruSubtypeDto[] = [];

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
    private codeService: CodeService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService
  ) {
    super(applicationDocumentService, dialog, toastService);
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
          projectDuration: applicationSubmission.naruProjectDuration,
          purpose: applicationSubmission.purpose,
          residenceNecessity: applicationSubmission.naruResidenceNecessity,
          agriTourism: applicationSubmission.naruAgriTourism,
          sleepingUnits: applicationSubmission.naruSleepingUnits
            ? applicationSubmission.naruSleepingUnits.toString()
            : null,
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

  async attachProposalMap(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
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
      this.projectDuration.enable();
      this.fillOrigin.enable();
      this.fillType.enable();
    } else {
      this.projectDuration.disable();
      this.fillOrigin.disable();
      this.fillType.disable();

      this.projectDuration.setValue(null);
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
        projectDuration,
        purpose,
        residenceNecessity,
        subtype,
        sleepingUnits,
        agriTourism,
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
        naruProjectDuration: projectDuration,
        purpose: purpose,
        naruResidenceNecessity: residenceNecessity,
        naruSubtypeCode: subtype,
        naruSleepingUnits: sleepingUnits ? parseFloat(sleepingUnits) : null,
        naruAgriTourism: agriTourism,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  private async loadNaruSubtypes() {
    const subtypes = await this.codeService.loadCodes();
    this.naruSubtypes = subtypes.naruSubtypes;
  }

  markDirty() {
    this.form.markAsDirty();
  }
}
