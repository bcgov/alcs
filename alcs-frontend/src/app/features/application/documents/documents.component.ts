import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationSubmissionToSubmissionStatusDto } from '../../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationSubmissionStatusService } from '../../../services/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../services/application/application.dto';
import { DOCUMENT_SYSTEM } from '../../../shared/document/document.dto';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DocumentUploadDialogComponent } from './document-upload-dialog/document-upload-dialog.component';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../shared/constants';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  displayedColumns: string[] = ['type', 'fileName', 'source', 'visibilityFlags', 'uploadedAt', 'actions'];
  documents: ApplicationDocumentDto[] = [];
  private fileId = '';

  DOCUMENT_SYSTEM = DOCUMENT_SYSTEM;

  hasBeenReceived = false;
  hasBeenSetForDiscussion = false;
  hiddenFromPortal = false;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<ApplicationDocumentDto> = new MatTableDataSource<ApplicationDocumentDto>();

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private applicationDetailService: ApplicationDetailService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private toastService: ToastService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.loadDocuments(application.fileNumber);
        this.loadStatusHistory(application.fileNumber);
        this.hiddenFromPortal = application.hideFromPortal;
      }
    });
  }

  async onUploadFile() {
    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileId: this.fileId,
        },
      })
      .beforeClosed()
      .subscribe((isDirty) => {
        if (isDirty) {
          this.loadDocuments(this.fileId);
        }
      });
  }

  async openFile(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName);
  }

  async downloadFile(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName, false);
  }

  private async loadDocuments(fileNumber: string) {
    this.documents = await this.applicationDocumentService.listAll(fileNumber);
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

  onEditFile(element: ApplicationDocumentDto) {
    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileId: this.fileId,
          existingDocument: element,
        },
      })
      .beforeClosed()
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
          await this.applicationDocumentService.delete(element.uuid);
          this.loadDocuments(this.fileId);
          this.toastService.showSuccessToast('Document deleted');
        }
      });
  }

  private async loadStatusHistory(fileNumber: string) {
    let statusHistory: ApplicationSubmissionToSubmissionStatusDto[] = [];
    try {
      statusHistory = await this.applicationSubmissionStatusService.fetchSubmissionStatusesByFileNumber(
        fileNumber,
        false,
      );
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    this.hasBeenReceived =
      statusHistory.filter(
        (status) => status.effectiveDate && status.statusTypeCode === SUBMISSION_STATUS.RECEIVED_BY_ALC,
      ).length > 0;

    this.hasBeenSetForDiscussion =
      statusHistory.filter(
        (status) => status.effectiveDate && status.statusTypeCode === SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
      ).length > 0;
  }
}
