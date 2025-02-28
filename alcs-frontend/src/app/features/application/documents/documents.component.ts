import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationSubmissionToSubmissionStatusDto } from '../../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationSubmissionStatusService } from '../../../services/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../services/application/application.dto';
import { DOCUMENT_SYSTEM, DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../shared/constants';
import { ApplicationSubmissionService } from '../../../services/application/application-submission/application-submission.service';
import { ApplicationParcelService } from '../../../services/application/application-parcel/application-parcel.service';
import {
  DocumentUploadDialogComponent,
  VisibilityGroup,
} from '../../../shared/document-upload-dialog/document-upload-dialog.component';
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
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  displayedColumns: string[] = ['source', 'type', 'fileName', 'visibilityFlags', 'uploadedAt', 'actions'];
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
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private applicationParcelService: ApplicationParcelService,
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
    const data: DocumentUploadDialogData = Object.assign(DOCUMENT_UPLOAD_DIALOG_OPTIONS, {
      fileId: this.fileId,
      documentService: this.applicationDocumentService,
      parcelService: this.applicationParcelService,
      submissionService: this.applicationSubmissionService,
    });

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

  async onEditFile(element: ApplicationDocumentDto) {
    const data: DocumentUploadDialogData = Object.assign(DOCUMENT_UPLOAD_DIALOG_OPTIONS, {
      allowsFileEdit: element.system === DOCUMENT_SYSTEM.ALCS,
      fileId: this.fileId,
      existingDocument: element,
      documentService: this.applicationDocumentService,
      parcelService: this.applicationParcelService,
      submissionService: this.applicationSubmissionService,
    });

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
