import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { MatTableDataSource } from '@angular/material/table';
import { ExistingResidenceDialogComponent } from './existing-residence-dialog/existing-residence-dialog.component';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { isTruncated, truncate } from '../../../../../shared/utils/string-helper';
import { EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT } from '../../../../../shared/constants';

export type FormExisingResidence = { id?: number; floorArea: number; description: string; isExpanded?: boolean };

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

  existingResidences: FormExisingResidence[] = [];
  existingResidencesSource = new MatTableDataSource(this.existingResidences);
  proposalMap: ApplicationDocumentDto[] = [];
  buildingPlans: ApplicationDocumentDto[] = [];
  fillTableData: SoilTableData = {};
  fillTableDisabled = true;
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  isExistingResidencesDirty = false;

  form = new FormGroup({
    willBeOverFiveHundredM2: this.willBeOverFiveHundredM2,
    willRetainResidence: this.willRetainResidence,
    willHaveAdditionalResidence: this.willHaveAdditionalResidence,
    willHaveTemporaryForeignWorkerHousing: this.willHaveTemporaryForeignWorkerHousing,
    willImportFill: this.willImportFill,
    purpose: this.purpose,
    residenceNecessity: this.residenceNecessity,
    clustered: this.clustered,
    setback: this.setback,
    locationRationale: this.locationRationale,
    infrastructure: this.infrastructure,
    fillType: this.fillType,
  });

  private submissionUuid = '';
  existingResidencesDisplayedColumns: string[] = ['index', 'floorArea', 'description', 'action'];

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
          clustered: applicationSubmission.naruClustered,
          setback: applicationSubmission.naruSetback,
          fillType: applicationSubmission.naruFillType,
          infrastructure: applicationSubmission.naruInfrastructure,
          locationRationale: applicationSubmission.naruLocationRationale,
        });

        if (applicationSubmission.naruWillImportFill !== null) {
          this.onChangeFill(applicationSubmission.naruWillImportFill);
          this.form.patchValue({
            willImportFill: applicationSubmission.naruWillImportFill,
          });
        }

        this.fillTableData = {
          area: applicationSubmission.naruToPlaceArea ?? undefined,
          maximumDepth: applicationSubmission.naruToPlaceMaximumDepth ?? undefined,
          averageDepth: applicationSubmission.naruToPlaceAverageDepth ?? undefined,
        };

        if (applicationSubmission.naruExistingResidences) {
          this.existingResidences = applicationSubmission.naruExistingResidences?.map((item, index) => ({
            id: index + 1,
            floorArea: item.floorArea,
            description: item.description,
            isExpanded: false,
          }));
          this.existingResidencesSource = new MatTableDataSource(this.existingResidences);
        }

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
    // TODO: check for values of any fields that will be removed
    //       if a user answers 'no'
    const hasValues = true;

    if (this.willBeOverFiveHundredM2.value !== null && !answerIsYes && hasValues) {
      this.confirmationDialogService
        .openDialog({
          title: 'Is your proposal for a principal residence with a total floor area greater than 500 m²?',
          body: 'Warning: Changing your answer could remove some content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.willBeOverFiveHundredM2.setValue(!confirmed);

          if (confirmed) {
            // TODO: wipe same fields as above
          }
        });
    }
  }

  onChangeRetain(answerIsYes: boolean) {
    // TODO: check for values of any fields that will be removed
    //       if a user answers 'no'
    const hasValues = true;

    if (this.willRetainResidence.value !== null && !answerIsYes && hasValues) {
      this.confirmationDialogService
        .openDialog({
          title: 'Is your proposal to retain an existing residence while building a new residence?',
          body: 'Warning: Changing your answer could remove some content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.willRetainResidence.setValue(!confirmed);

          if (confirmed) {
            // TODO: wipe same fields as above
          }
        });
    }
  }

  onChangeAdditional(answerIsYes: boolean) {
    // TODO: check for values of any fields that will be removed
    //       if a user answers 'no'
    const hasValues = true;

    if (this.willHaveAdditionalResidence.value !== null && !answerIsYes && hasValues) {
      this.confirmationDialogService
        .openDialog({
          title: 'Is your proposal for an additional residence?',
          body: 'Warning: Changing your answer could remove some content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.willHaveAdditionalResidence.setValue(!confirmed);

          if (confirmed) {
            // TODO: wipe same fields as above
          }
        });
    }
  }

  onChangeTemporaryHousing(answerIsYes: boolean) {
    // TODO: check for values of any fields that will be removed
    //       if a user answers 'no'
    const hasValues = true;

    if (this.willHaveTemporaryForeignWorkerHousing.value !== null && !answerIsYes && hasValues) {
      this.confirmationDialogService
        .openDialog({
          title: 'Is your proposal for temporary foreign worker housing?',
          body: 'Warning: Changing your answer could remove some content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.willHaveTemporaryForeignWorkerHousing.setValue(!confirmed);

          if (confirmed) {
            // TODO: wipe same fields as above
          }
        });
    }
  }

  onChangeFill(willImportFill: boolean) {
    const hasValues =
      this.fillType.value ||
      this.fillTableData.area ||
      this.fillTableData.averageDepth ||
      this.fillTableData.maximumDepth;

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
      this.fillType.enable();
    } else {
      this.fillType.disable();

      this.fillType.setValue(null);
    }
  }

  protected async save() {
    if (this.fileId && (this.form.dirty || this.isExistingResidencesDirty)) {
      const {
        willBeOverFiveHundredM2,
        willRetainResidence,
        willHaveAdditionalResidence,
        willHaveTemporaryForeignWorkerHousing,
        willImportFill,
        purpose,
        residenceNecessity,
        clustered,
        setback,
        fillType,
        infrastructure,
        locationRationale,
      } = this.form.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        naruWillBeOverFiveHundredM2: willBeOverFiveHundredM2,
        naruWillRetainResidence: willRetainResidence,
        naruWillHaveAdditionalResidence: willHaveAdditionalResidence,
        naruWillHaveTemporaryForeignWorkerHousing: willHaveTemporaryForeignWorkerHousing,
        naruWillImportFill: willImportFill,
        purpose: purpose,
        naruResidenceNecessity: residenceNecessity,
        naruClustered: clustered,
        naruSetback: setback,
        naruFillType: fillType,
        naruToPlaceAverageDepth: this.fillTableData.averageDepth ?? null,
        naruToPlaceMaximumDepth: this.fillTableData.maximumDepth ?? null,
        naruToPlaceArea: this.fillTableData.area ?? null,
        naruInfrastructure: infrastructure,
        naruLocationRationale: locationRationale,
        naruExistingResidences: this.existingResidences.map(({ id, ...rest }) => rest),
      };
      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  markDirty() {
    this.form.markAsDirty();
  }

  onAddEditExistingResidence(existingResidence: FormExisingResidence | undefined, isEdit: boolean) {
    const dialog = this.dialog
      .open(ExistingResidenceDialogComponent, {
        width: this.isMobile ? '90%' : '75%',
        data: {
          isEdit: isEdit,
          existingResidenceData: existingResidence,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (!res.isCancel) {
          this.isExistingResidencesDirty = true;
          if (res.isEdit) {
            const index = this.existingResidences.findIndex((e) => e.id === res.existingResidence.id);
            if (index > -1) {
              this.existingResidences[index] = res.existingResidence;
            }
          } else {
            this.existingResidences.push({ ...res.existingResidence, id: this.existingResidences.length + 1 });
          }
          this.existingResidencesSource.data = this.existingResidences;
        }
      });
  }

  onDeleteExistingResidence(existingResidence: FormExisingResidence) {
    this.confirmationDialogService
      .openDialog({ title: 'Remove existing residence?', body: 'Do you want to continue?' })
      .subscribe((confirmed) => {
        if (confirmed) {
          const index = this.existingResidences.findIndex((e) => e.id === existingResidence.id);
          if (index > -1) {
            this.existingResidences.splice(index, 1);
            this.existingResidencesSource.data = this.existingResidences;
            this.isExistingResidencesDirty = true;
            this.existingResidences.forEach((item, index) => {
              item.id = index + 1;
            });
          }
        }
      });
  }

  getTruncatedDescription(description: string): string {
    return truncate(description, EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT);
  }

  isDescriptionTruncated(description: string): boolean {
    return isTruncated(description, EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT);
  }

  toggleReadMore(existingResidence: FormExisingResidence) {
    const index = this.existingResidences.findIndex((e) => e.id === existingResidence.id);
    if (index > -1) {
      this.existingResidences[index].isExpanded = !this.existingResidences[index].isExpanded;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
