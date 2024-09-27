import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../../services/code/code.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-naru-proposal',
  templateUrl: './naru-proposal.component.html',
  styleUrls: ['./naru-proposal.component.scss'],
})
export class NaruProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  showProposalMapVirus = false;
  showBuildingPlanVirus = false;

  willBeOverFiveHundredM2 = new FormControl<boolean | null>(null, [Validators.required]);
  willRetainResidence = new FormControl<boolean | null>(null, [Validators.required]);
  willHaveAdditionalResidence = new FormControl<boolean | null>(null, [Validators.required]);
  willHaveTemporaryForeignWorkerHousing = new FormControl<boolean | null>(null, [Validators.required]);
  willImportFill = new FormControl<boolean | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  residenceNecessity = new FormControl<string | null>(null, [Validators.required]);
  tfwhCount = new FormControl<string | null>(null, [Validators.required]);
  tfwhDesign = new FormControl<boolean | null>(null, [Validators.required]);
  tfwhFarmSize = new FormControl<string | null>(null, [Validators.required]);
  clustered = new FormControl<string | null>(null, [Validators.required]);
  setback = new FormControl<string | null>(null, [Validators.required]);
  locationRationale = new FormControl<string | null>(null, [Validators.required]);
  infrastructure = new FormControl<string | null>(null, [Validators.required]);
  fillType = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );
  fillOrigin = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );
  projectDuration = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );

  proposalMap: ApplicationDocumentDto[] = [];
  buildingPlans: ApplicationDocumentDto[] = [];
  fillTableData: SoilTableData = {};
  fillTableDisabled = true;

  form = new FormGroup({
    willBeOverFiveHundredM2: this.willBeOverFiveHundredM2,
    willRetainResidence: this.willRetainResidence,
    willHaveAdditionalResidence: this.willHaveAdditionalResidence,
    willHaveTemporaryForeignWorkerHousing: this.willHaveTemporaryForeignWorkerHousing,
    willImportFill: this.willImportFill,
    purpose: this.purpose,
    residenceNecessity: this.residenceNecessity,
    tfwhCount: this.tfwhCount,
    tfwhDesign: this.tfwhDesign,
    tfwhFarmSize: this.tfwhFarmSize,
    clustered: this.clustered,
    setback: this.setback,
    locationRationale: this.locationRationale,
    infrastructure: this.infrastructure,
    fillType: this.fillType,
    fillOrigin: this.fillOrigin,
    projectDuration: this.projectDuration,
  });

  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
    private codeService: CodeService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
    toastService: ToastService,
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.form.patchValue({
          willBeOverFiveHundredM2: applicationSubmission.naruWillBeOverFiveHundredM2,
          willRetainResidence: applicationSubmission.naruWillRetainResidence,
          willHaveAdditionalResidence: applicationSubmission.naruWillHaveAdditionalResidence,
          willHaveTemporaryForeignWorkerHousing: applicationSubmission.naruWillHaveTemporaryForeignWorkerHousing,
          willImportFill: applicationSubmission.naruWillImportFill,
          purpose: applicationSubmission.purpose,
          residenceNecessity: applicationSubmission.naruResidenceNecessity,
          tfwhCount: applicationSubmission.tfwhCount,
          tfwhDesign: applicationSubmission.tfwhDesign,
          tfwhFarmSize: applicationSubmission.tfwhFarmSize,
          clustered: applicationSubmission.naruClustered,
          setback: applicationSubmission.naruSetback,
          fillType: applicationSubmission.naruFillType,
          fillOrigin: applicationSubmission.naruFillOrigin,
          infrastructure: applicationSubmission.naruInfrastructure,
          locationRationale: applicationSubmission.naruLocationRationale,
          projectDuration: applicationSubmission.naruProjectDuration,
        });

        if (applicationSubmission.naruWillImportFill !== null) {
          this.onChangeFill(applicationSubmission.naruWillImportFill);
          this.form.patchValue({
            willImportFill: applicationSubmission.naruWillImportFill,
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
      this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
    });
  }

  async onSave() {
    await this.save();
  }

  async attachProposalMap(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
  }

  async attachBuildingPlan(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.BUILDING_PLAN);
    this.showBuildingPlanVirus = !res;
  }

  onChangeOver500m2(answerIsYes: boolean) {
    if (
      !answerIsYes &&
      this.residenceNecessity.value &&
      this.willHaveAdditionalResidence.value !== true &&
      this.willHaveTemporaryForeignWorkerHousing.value !== true
    ) {
      this.confirmationDialogService
        .openDialog({
          title: 'Is your proposal for a principal residence with a total floor area greater than 500 m²?',
          body: 'Warning: Changing your answer could remove some content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.willBeOverFiveHundredM2.setValue(!confirmed);

          if (confirmed) {
            this.residenceNecessity.setValue(null);
          }
        });
    }
  }

  onChangeAdditional(answerIsYes: boolean) {
    if (
      !answerIsYes &&
      this.residenceNecessity.value &&
      this.willBeOverFiveHundredM2.value !== true &&
      this.willHaveTemporaryForeignWorkerHousing.value !== true
    ) {
      this.confirmationDialogService
        .openDialog({
          title: 'Is your proposal for an additional residence?',
          body: 'Warning: Changing your answer could remove some content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.willHaveAdditionalResidence.setValue(!confirmed);

          if (confirmed) {
            this.residenceNecessity.setValue(null);
          }
        });
    }
  }

  onChangeTemporaryHousing(answerIsYes: boolean) {
    console.log(this.tfwhCount.value);
    console.log(this.tfwhDesign.value);
    console.log(this.tfwhFarmSize.value);
    console.log(this.tfwhCount.value || this.tfwhDesign.value !== null || this.tfwhFarmSize.value);
    if (
      !answerIsYes &&
      (this.tfwhCount.value ||
        this.tfwhDesign.value !== null ||
        this.tfwhFarmSize.value ||
        (this.residenceNecessity.value &&
          this.willBeOverFiveHundredM2.value !== true &&
          this.willHaveAdditionalResidence.value !== true))
    ) {
      this.confirmationDialogService
        .openDialog({
          title: 'Is your proposal for temporary foreign worker housing?',
          body: 'Warning: Changing your answer could remove some content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.willHaveTemporaryForeignWorkerHousing.setValue(!confirmed);

          if (confirmed) {
            this.tfwhCount.setValue(null);
            this.tfwhDesign.setValue(null);
            this.tfwhFarmSize.setValue(null);

            if (this.willBeOverFiveHundredM2.value !== true && this.willHaveAdditionalResidence.value !== true) {
              this.residenceNecessity.setValue(null);
            }
          }
        });
    }
  }

  onChangeFill(willImportFill: boolean) {
    const hasValues =
      this.projectDuration.value ||
      this.fillOrigin.value ||
      this.fillType.value ||
      this.fillTableData.area ||
      this.fillTableData.averageDepth ||
      this.fillTableData.maximumDepth ||
      this.fillTableData.volume;

    if (!willImportFill && hasValues) {
      this.confirmationDialogService
        .openDialog({
          title: 'Do you need to import any fill to construct or conduct the proposed Non-farm use?',
          body: 'Changing the answer to this question will remove content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.updateFillFields(!confirmed);
          this.willImportFill.setValue(!confirmed);
        });
    } else {
      this.updateFillFields(willImportFill);
    }
  }

  updateFillFields(willImportFill: boolean) {
    this.fillTableDisabled = !willImportFill;

    if (willImportFill) {
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
        willBeOverFiveHundredM2,
        willRetainResidence,
        willHaveAdditionalResidence,
        willHaveTemporaryForeignWorkerHousing,
        willImportFill,
        purpose,
        residenceNecessity,
        tfwhCount,
        tfwhDesign,
        tfwhFarmSize,
        clustered,
        setback,
        fillType,
        fillOrigin,
        infrastructure,
        locationRationale,
        projectDuration,
      } = this.form.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        naruWillBeOverFiveHundredM2: willBeOverFiveHundredM2,
        naruWillRetainResidence: willRetainResidence,
        naruWillHaveAdditionalResidence: willHaveAdditionalResidence,
        naruWillHaveTemporaryForeignWorkerHousing: willHaveTemporaryForeignWorkerHousing,
        naruWillImportFill: willImportFill,
        purpose: purpose,
        naruResidenceNecessity: residenceNecessity,
        tfwhCount: tfwhCount,
        tfwhDesign: tfwhDesign,
        tfwhFarmSize: tfwhFarmSize,
        naruClustered: clustered,
        naruSetback: setback,
        naruFillType: fillType,
        naruFillOrigin: fillOrigin,
        naruToPlaceAverageDepth: this.fillTableData.averageDepth ?? null,
        naruToPlaceMaximumDepth: this.fillTableData.maximumDepth ?? null,
        naruToPlaceArea: this.fillTableData.area ?? null,
        naruToPlaceVolume: this.fillTableData.volume ?? null,
        naruInfrastructure: infrastructure,
        naruLocationRationale: locationRationale,
        naruProjectDuration: projectDuration,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  markDirty() {
    this.form.markAsDirty();
  }
}
