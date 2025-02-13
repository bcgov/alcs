import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { CodeService } from '../../../../services/code/code.service';
import {
  NoticeOfIntentDocumentDto,
  NoticeOfIntentDocumentUpdateDto,
} from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditNoiSteps } from '../edit-submission.component';
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
  currentStep = EditNoiSteps.Attachments;

  displayedColumns = ['fileName', 'type', 'description', 'actions'];
  selectableTypes: DocumentTypeDto[] = [];
  otherFiles: NoticeOfIntentDocumentDto[] = [];

  private isDirty = false;

  private documentCodes: DocumentTypeDto[] = [];
  showHasVirusError = false;
  showVirusScanFailedError = false;
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  constructor(
    private codeService: CodeService,
    noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    dialog: MatDialog,
    toastService: ToastService,
  ) {
    super(noticeOfIntentDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
      }
    });

    this.loadDocumentCodes();

    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
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
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  protected async save() {
    if (this.isDirty) {
      const updateDtos: NoticeOfIntentDocumentUpdateDto[] = this.otherFiles.map((file) => ({
        uuid: file.uuid,
        description: file.description,
        type: file.type?.code ?? null,
      }));
      await this.noticeOfIntentDocumentService.update(this.fileId, updateDtos);
    }
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.documentTypes;
    this.selectableTypes = this.documentCodes.filter((code) => USER_CONTROLLED_TYPES.includes(code.code));
  }

  onAddEditAttachment(attachment: NoticeOfIntentDocumentDto | undefined) {
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
