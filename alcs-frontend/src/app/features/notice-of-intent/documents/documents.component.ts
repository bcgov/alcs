import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationSubmissionToSubmissionStatusDto } from '../../../services/application/application-submission-status/application-submission-status.dto';
import { SUBMISSION_STATUS } from '../../../services/application/application.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentSubmissionToSubmissionStatusDto,
} from '../../../services/notice-of-intent/notice-of-intent.dto';
import { DOCUMENT_SYSTEM, DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NoiDocumentService } from '../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../shared/constants';
import {
  DocumentUploadDialogComponent,
  VisibilityGroup,
} from '../../../shared/document-upload-dialog/document-upload-dialog.component';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentParcelService } from '../../../services/notice-of-intent/notice-of-intent-parcel/notice-of-intent-parcel.service';
import {
  DocumentUploadDialogData,
  DocumentUploadDialogOptions,
} from '../../../shared/document-upload-dialog/document-upload-dialog.interface';

const DOCUMENT_UPLOAD_DIALOG_OPTIONS: DocumentUploadDialogOptions = {
  allowedVisibilityFlags: ['A', 'C', 'G', 'P'],
  allowsFileEdit: true,
  documentTypeOverrides: {
    [DOCUMENT_TYPE.CERTIFICATE_OF_TITLE]: {
      visibilityGroups: [VisibilityGroup.INTERNAL],
      allowsFileEdit: false,
    },
    [DOCUMENT_TYPE.CORPORATE_SUMMARY]: {
      visibilityGroups: [VisibilityGroup.INTERNAL],
      allowsFileEdit: false,
    },
  },
};

@Component({
  selector: 'app-noi-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class NoiDocumentsComponent implements OnInit {
  displayedColumns: string[] = ['source', 'type', 'fileName', 'visibilityFlags', 'uploadedAt', 'actions'];
  documents: NoticeOfIntentDocumentDto[] = [];
  private fileId = '';

  DOCUMENT_SYSTEM = DOCUMENT_SYSTEM;

  hasBeenReceived = false;
  hiddenFromPortal = false;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<NoticeOfIntentDocumentDto> = new MatTableDataSource<NoticeOfIntentDocumentDto>();

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  constructor(
    private noiDocumentService: NoiDocumentService,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private confirmationDialogService: ConfirmationDialogService,
    private noiSubmissionService: NoticeOfIntentSubmissionService,
    private noiSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private noiParcelService: NoticeOfIntentParcelService,
    private toastService: ToastService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent.subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.fileId = noticeOfIntent.fileNumber;
        this.hiddenFromPortal = noticeOfIntent.hideFromPortal;
        this.loadDocuments(noticeOfIntent.fileNumber);
        this.loadStatusHistory(noticeOfIntent.fileNumber);
      }
    });
  }

  async onUploadFile() {
    const data: DocumentUploadDialogData = {
      ...DOCUMENT_UPLOAD_DIALOG_OPTIONS,
      ...{
        fileId: this.fileId,
        documentService: this.noiDocumentService,
        parcelService: this.noiParcelService,
        submissionService: this.noiSubmissionService,
      },
    };

    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data,
      })
      .afterClosed()
      .subscribe((isDirty) => {
        if (isDirty) {
          this.loadDocuments(this.fileId);
        }
      });
  }

  async openFile(uuid: string, fileName: string) {
    await this.noiDocumentService.download(uuid, fileName);
  }

  async downloadFile(uuid: string, fileName: string) {
    await this.noiDocumentService.download(uuid, fileName, false);
  }

  async onEditFile(element: NoticeOfIntentDocumentDto) {
    const data: DocumentUploadDialogData = {
      ...DOCUMENT_UPLOAD_DIALOG_OPTIONS,
      ...{
        allowsFileEdit: element.system === DOCUMENT_SYSTEM.ALCS,
        fileId: this.fileId,
        existingDocument: element,
        documentService: this.noiDocumentService,
        parcelService: this.noiParcelService,
        submissionService: this.noiSubmissionService,
      },
    };

    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data,
      })
      .afterClosed()
      .subscribe((isDirty: boolean) => {
        if (isDirty) {
          this.loadDocuments(this.fileId);
        }
      });
  }

  onDeleteFile(element: ApplicationDocumentDto) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected file?',
      })
      .subscribe(async (accepted) => {
        if (accepted) {
          await this.noiDocumentService.delete(element.uuid);
          this.loadDocuments(this.fileId);
          this.toastService.showSuccessToast('Document deleted');
        }
      });
  }

  private async loadDocuments(fileNumber: string) {
    this.documents = await this.noiDocumentService.listAll(fileNumber);
    this.dataSource = new MatTableDataSource(this.documents);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'type':
          return item.type?.oatsCode;
        default: // @ts-ignore Does not like using String for Key access, but that's what Angular provides
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  private async loadStatusHistory(fileNumber: string) {
    let statusHistory: NoticeOfIntentSubmissionToSubmissionStatusDto[] = [];
    try {
      statusHistory = await this.noiSubmissionStatusService.fetchSubmissionStatusesByFileNumber(fileNumber, false);
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    this.hasBeenReceived =
      statusHistory.filter(
        (status) => status.effectiveDate && status.statusTypeCode === NOI_SUBMISSION_STATUS.RECEIVED_BY_ALC,
      ).length > 0;
  }
}
