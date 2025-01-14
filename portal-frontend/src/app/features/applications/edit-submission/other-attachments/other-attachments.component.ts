import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  ApplicationDocumentUpdateDto,
} from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../services/code/code.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { OtherAttachmentsUploadDialogComponent } from './other-attachments-upload-dialog/other-attachments-upload-dialog.component';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { HttpErrorResponse } from '@angular/common/http';

const USER_CONTROLLED_TYPES = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

@Component({
  selector: 'app-other-attachments',
  templateUrl: './other-attachments.component.html',
  styleUrls: ['./other-attachments.component.scss'],
})
export class OtherAttachmentsComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Attachments;

  displayedColumns = ['fileName', 'type', 'description', 'actions'];
  selectableTypes: DocumentTypeDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];

  private isDirty = false;
  showHasVirusError = false;
  showVirusScanFailedError = false;
  showUnknownError = false;
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  form = new FormGroup({} as any);
  private documentCodes: DocumentTypeDto[] = [];

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private codeService: CodeService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService,
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
      }
    });

    this.loadDocumentCodes();

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.otherFiles = documents
        .filter((file) => (file.type ? USER_CONTROLLED_TYPES.includes(file.type.code) : true))
        .filter((file) => file.source === DOCUMENT_SOURCE.APPLICANT)
        .sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });
    });
  }

  async onSave() {
    await this.save();
  }

  async attachDocument(file: FileHandle) {
    try {
      await this.attachFile(file, null);
      this.showHasVirusError = false;
      this.showVirusScanFailedError = false;
      this.showUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showUnknownError = !this.showHasVirusError || !this.showVirusScanFailedError;
    }
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

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.documentTypes;
    this.selectableTypes = this.documentCodes.filter((code) => USER_CONTROLLED_TYPES.includes(code.code));
  }

  onAddEditAttachment(attachment: ApplicationDocumentDto | undefined) {
    this.dialog
      .open(OtherAttachmentsUploadDialogComponent, {
        width: this.isMobile ? '90%' : '50%',
        data: {
          fileId: this.fileId,
          otherAttachmentsComponent: this,
          existingDocument: attachment,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        await this.refreshFiles();
      });
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
