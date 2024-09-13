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

  purpose = new FormControl<string | null>(null, [Validators.required]);
  locationRationale = new FormControl<string | null>(null, [Validators.required]);
  infrastructure = new FormControl<string | null>(null, [Validators.required]);
  willImportFill = new FormControl<boolean | null>(null, [Validators.required]);
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
  fillTableData: SoilTableData = {};
  fillTableDisabled = true;

  form = new FormGroup({
    purpose: this.purpose,
    locationRationale: this.locationRationale,
    infrastructure: this.infrastructure,
    willImportFill: this.willImportFill,
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
          willImportFill: applicationSubmission.naruWillImportFill,
          fillType: applicationSubmission.naruFillType,
          fillOrigin: applicationSubmission.naruFillOrigin,
          infrastructure: applicationSubmission.naruInfrastructure,
          locationRationale: applicationSubmission.naruLocationRationale,
          projectDuration: applicationSubmission.naruProjectDuration,
          purpose: applicationSubmission.purpose,
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
    });
  }

  async onSave() {
    await this.save();
  }

  async attachProposalMap(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
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
      const { willImportFill, fillType, fillOrigin, infrastructure, locationRationale, projectDuration, purpose } =
        this.form.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        naruWillImportFill: willImportFill,
        naruFillType: fillType,
        naruFillOrigin: fillOrigin,
        naruToPlaceAverageDepth: this.fillTableData.averageDepth ?? null,
        naruToPlaceMaximumDepth: this.fillTableData.maximumDepth ?? null,
        naruToPlaceArea: this.fillTableData.area ?? null,
        naruToPlaceVolume: this.fillTableData.volume ?? null,
        naruInfrastructure: infrastructure,
        naruLocationRationale: locationRationale,
        naruProjectDuration: projectDuration,
        purpose: purpose,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  markDirty() {
    this.form.markAsDirty();
  }
}
