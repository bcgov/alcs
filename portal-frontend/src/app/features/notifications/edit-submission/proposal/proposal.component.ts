import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import {
  NotificationDocumentDto,
  NotificationDocumentUpdateDto,
} from '../../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../services/notification-document/notification-document.service';
import { NotificationSubmissionUpdateDto } from '../../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditNotificationSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { ChangeSurveyPlanConfirmationDialogComponent } from './change-survey-plan-confirmation-dialog/change-survey-plan-confirmation-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { downloadFile } from '../../../../shared/utils/file';
import { DocumentService } from '../../../../services/document/document.service';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
})
export class ProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNotificationSteps.Proposal;
  DOCUMENT = DOCUMENT_TYPE;
  allowSurveyPlanUploads = false;

  terms: NotificationDocumentDto[] = [];
  surveyPlans: NotificationDocumentDto[] = [];
  displayedColumns = ['fileName', 'surveyPlan', 'control', 'actions'];

  purpose = new FormControl<string | null>(null, [Validators.required]);
  totalArea = new FormControl<string | null>(null, [Validators.required]);
  fileNumber = new FormControl<string | null>(null, [Validators.required]);
  hasSurveyPlan = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    fileNumber: this.fileNumber,
    purpose: this.purpose,
    totalArea: this.totalArea,
    hasSurveyPlan: this.hasSurveyPlan,
  });

  private submissionUuid = '';
  private isDirty = false;
  surveyForm = new FormGroup({} as any);
  showSRWTermsHasVirusError = false;
  showSRWTermsVirusScanFailedError = false;
  showSurveyPlanHasVirusError = false;
  showSurveyPlanVirusScanFailedError = false;

  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
    notificationDocumentService: NotificationDocumentService,
    dialog: MatDialog,
    toastService: ToastService,
    private documentService: DocumentService,
  ) {
    super(notificationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      if (submission) {
        this.fileId = submission.fileNumber;
        this.submissionUuid = submission.uuid;

        this.allowSurveyPlanUploads = !!submission.hasSurveyPlan;

        this.form.patchValue({
          fileNumber: submission.submittersFileNumber,
          purpose: submission.purpose,
          hasSurveyPlan: formatBooleanToString(submission.hasSurveyPlan),
          totalArea: submission.totalArea?.toString(),
        });
        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$notificationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.terms = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS);
      this.surveyPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SURVEY_PLAN);

      const newForm = new FormGroup({});
      for (const file of this.surveyPlans) {
        newForm.addControl(`${file.uuid}-surveyPlan`, new FormControl(file.surveyPlanNumber, [Validators.required]));
        newForm.addControl(`${file.uuid}-control`, new FormControl(file.controlNumber, [Validators.required]));
      }
      this.surveyForm = newForm;
      if (this.showErrors) {
        this.surveyForm.markAllAsTouched();
      }
    });
  }

  async attachSRWTerms(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.SRW_TERMS);
      this.showSRWTermsHasVirusError = false;
      this.showSRWTermsVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showSRWTermsHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showSRWTermsVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async attachSurveyPlan(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.SURVEY_PLAN);
      this.showSurveyPlanHasVirusError = false;
      this.showSurveyPlanVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showSurveyPlanHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showSurveyPlanVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const purpose = this.purpose.value;
      const submittersFileNumber = this.fileNumber.value;
      const totalArea = this.totalArea.value;
      const hasSurveyPlan = this.hasSurveyPlan.value;

      const updateDto: NotificationSubmissionUpdateDto = {
        purpose,
        submittersFileNumber,
        totalArea: totalArea ? parseFloat(totalArea) : null,
        hasSurveyPlan: parseStringToBoolean(hasSurveyPlan),
      };

      const updatedApp = await this.notificationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$notificationSubmission.next(updatedApp);
    }

    if (this.isDirty) {
      const updateDtos: NotificationDocumentUpdateDto[] = this.surveyPlans.map((file) => ({
        uuid: file.uuid,
        surveyPlanNumber: file.surveyPlanNumber || null,
        controlNumber: file.controlNumber || null,
      }));
      await this.notificationDocumentService.update(this.fileId, updateDtos);
      const updatedDocuments = await this.notificationDocumentService.getByFileId(this.fileId);
      if (updatedDocuments) {
        this.$notificationDocuments.next(updatedDocuments);
      }
    }
  }

  onChangeHasSurveyPlan(selectedValue: string) {
    if (selectedValue === 'false' && this.surveyPlans.length > 0) {
      this.dialog
        .open(ChangeSurveyPlanConfirmationDialogComponent)
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            for (const file of this.surveyPlans) {
              await this.onDeleteFile(file);
            }
            this.allowSurveyPlanUploads = false;
          } else {
            this.allowSurveyPlanUploads = true;
            this.hasSurveyPlan.setValue('true');
          }
        });
    } else {
      this.allowSurveyPlanUploads = selectedValue === 'true';
    }
  }

  onChangeControlNumber(uuid: any, event: Event) {
    this.isDirty = true;
    const input = event.target as HTMLInputElement;
    const controlPlanNumber = input.value;
    this.surveyPlans = this.surveyPlans.map((file) => {
      if (uuid === file.uuid) {
        file.controlNumber = controlPlanNumber;
      }
      return file;
    });
  }

  onChangeSurveyPlan(uuid: any, event: Event) {
    this.isDirty = true;
    const input = event.target as HTMLInputElement;
    const surveyPlanNumber = input.value;
    this.surveyPlans = this.surveyPlans.map((file) => {
      if (uuid === file.uuid) {
        file.surveyPlanNumber = surveyPlanNumber;
      }
      return file;
    });
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }
}
