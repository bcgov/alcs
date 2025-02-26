import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationDocumentDto } from '../../../services/notification/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../services/notification/notification-document/notification-document.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DOCUMENT_SYSTEM } from '../../../shared/document/document.dto';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../shared/constants';
import { DocumentUploadDialogComponent } from '../../../shared/document-upload-dialog/document-upload-dialog.component';
import {
  DocumentUploadDialogData,
  DocumentUploadDialogOptions,
} from '../../../shared/document-upload-dialog/document-upload-dialog.interface';

const DOCUMENT_UPLOAD_DIALOG_OPTIONS: DocumentUploadDialogOptions = {
  allowedVisibilityFlags: ['A', 'G', 'P'],
  allowsFileEdit: true,
};

@Component({
  selector: 'app-notification-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class NotificationDocumentsComponent implements OnInit {
  displayedColumns: string[] = ['source', 'type', 'fileName', 'visibilityFlags', 'uploadedAt', 'actions'];
  documents: NotificationDocumentDto[] = [];
  private fileId = '';

  DOCUMENT_SYSTEM = DOCUMENT_SYSTEM;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<NotificationDocumentDto> = new MatTableDataSource<NotificationDocumentDto>();

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  constructor(
    private notificationDocumentService: NotificationDocumentService,
    private notificationDetailService: NotificationDetailService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.notificationDetailService.$notification.subscribe((notification) => {
      if (notification) {
        this.fileId = notification.fileNumber;
        this.loadDocuments(notification.fileNumber);
      }
    });
  }

  async onUploadFile() {
    const data: DocumentUploadDialogData = Object.assign(DOCUMENT_UPLOAD_DIALOG_OPTIONS, {
      fileId: this.fileId,
      documentService: this.notificationDocumentService,
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
    await this.notificationDocumentService.download(uuid, fileName);
  }

  async downloadFile(uuid: string, fileName: string) {
    await this.notificationDocumentService.download(uuid, fileName, false);
  }

  private async loadDocuments(fileNumber: string) {
    this.documents = await this.notificationDocumentService.listAll(fileNumber);
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

  onEditFile(element: NoticeOfIntentDocumentDto) {
    const data: DocumentUploadDialogData = Object.assign(DOCUMENT_UPLOAD_DIALOG_OPTIONS, {
      allowsFileEdit: element.system === DOCUMENT_SYSTEM.ALCS,
      fileId: this.fileId,
      existingDocument: element,
      documentService: this.notificationDocumentService,
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
          await this.notificationDocumentService.delete(element.uuid);
          this.loadDocuments(this.fileId);
          this.toastService.showSuccessToast('Document deleted');
        }
      });
  }
}
