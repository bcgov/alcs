import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
  ApplicationDocumentUpdateDto,
  DOCUMENT_SOURCE,
  DOCUMENT_TYPE,
} from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../services/code/code.service';
import { EditApplicationSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';

const USER_CONTROLLED_TYPES = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

@Component({
  selector: 'app-other-attachments',
  templateUrl: './other-attachments.component.html',
  styleUrls: ['./other-attachments.component.scss'],
})
export class OtherAttachmentsComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Attachments;

  displayedColumns = ['type', 'description', 'fileName', 'actions'];
  selectableTypes: ApplicationDocumentTypeDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];

  private isDirty = false;

  form = new FormGroup({} as any);
  private documentCodes: ApplicationDocumentTypeDto[] = [];

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private codeService: CodeService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog
  ) {
    super(applicationDocumentService, dialog);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.loadDocumentCodes();
      this.otherFiles = documents
        .filter((file) => (file.type ? USER_CONTROLLED_TYPES.includes(file.type.code) : true))
        .filter((file) => file.source === DOCUMENT_SOURCE.APPLICANT)
        .sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });
      const newForm = new FormGroup({});
      for (const file of this.otherFiles) {
        newForm.addControl(`${file.uuid}-type`, new FormControl(file.type?.code, [Validators.required]));
        newForm.addControl(`${file.uuid}-description`, new FormControl(file.description, [Validators.required]));
      }
      this.form = newForm;
      if (this.showErrors) {
        this.form.markAllAsTouched();
      }
    });
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    if (this.isDirty) {
      const updateDtos: ApplicationDocumentUpdateDto[] = this.otherFiles.map((file) => ({
        uuid: file.uuid,
        description: file.description,
        type: file.type?.code ?? null,
      }));
      await this.applicationDocumentService.update(this.fileId, updateDtos);
    }
  }

  onChangeDescription(uuid: string, event: Event) {
    this.isDirty = true;
    const input = event.target as HTMLInputElement;
    const description = input.value;
    this.otherFiles = this.otherFiles.map((file) => {
      if (uuid === file.uuid) {
        file.description = description;
      }
      return file;
    });
  }

  onChangeType(uuid: string, selectedValue: DOCUMENT_TYPE) {
    this.isDirty = true;
    this.otherFiles = this.otherFiles.map((file) => {
      if (uuid === file.uuid) {
        const newType = this.documentCodes.find((code) => code.code === selectedValue);
        if (newType) {
          file.type = newType;
        } else {
          console.error('Failed to find matching document type');
        }
      }
      return file;
    });
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.applicationDocumentTypes;
    this.selectableTypes = this.documentCodes.filter((code) => USER_CONTROLLED_TYPES.includes(code.code));
  }
}
