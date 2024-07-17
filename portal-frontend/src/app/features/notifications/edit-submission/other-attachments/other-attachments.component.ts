import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { CodeService } from '../../../../services/code/code.service';
import {
  NotificationDocumentDto,
  NotificationDocumentUpdateDto,
} from '../../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../services/notification-document/notification-document.service';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditNotificationSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { OtherAttachmentsUploadDialogComponent } from './other-attachments-upload-dialog/other-attachments-upload-dialog.component';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';

const USER_CONTROLLED_TYPES = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

@Component({
  selector: 'app-other-attachments',
  templateUrl: './other-attachments.component.html',
  styleUrls: ['./other-attachments.component.scss'],
})
export class OtherAttachmentsComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNotificationSteps.Attachments;

  displayedColumns = ['fileName', 'type', 'description', 'actions'];
  selectableTypes: DocumentTypeDto[] = [];
  otherFiles: NotificationDocumentDto[] = [];

  private isDirty = false;
  showVirusError = false;
  isMobile = false;

  private documentCodes: DocumentTypeDto[] = [];

  constructor(
    private router: Router,
    private applicationService: NotificationSubmissionService,
    private codeService: CodeService,
    toastService: ToastService,
    notificationDocumentService: NotificationDocumentService,
    dialog: MatDialog
  ) {
    super(notificationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      if (submission) {
        this.fileId = submission.fileNumber;
      }
    });

    this.loadDocumentCodes();

    this.$notificationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
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
    const res = await this.attachFile(file, null);
    this.showVirusError = !res;
  }

  protected async save() {
    if (this.isDirty) {
      const updateDtos: NotificationDocumentUpdateDto[] = this.otherFiles.map((file) => ({
        uuid: file.uuid,
        description: file.description,
        type: file.type?.code ?? null,
      }));
      await this.notificationDocumentService.update(this.fileId, updateDtos);
    }
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.documentTypes;
    this.selectableTypes = this.documentCodes.filter((code) => USER_CONTROLLED_TYPES.includes(code.code));
  }

  onAddEditAttachment(attachment: NotificationDocumentDto | undefined) {
    this.dialog
      .open(OtherAttachmentsUploadDialogComponent, {
        width: this.isMobile? '90%' : '50%',
        data: {
          fileId: this.fileId,
          otherAttachmentsComponent: this,
          existingDocument: attachment,
        }
    }).afterClosed().subscribe(async res => {
      await this.refreshFiles();
    });
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
