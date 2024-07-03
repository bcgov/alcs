import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryDocumentDto } from '../../../services/inquiry/inquiry-document/inquiry-document.dto';
import { InquiryDocumentService } from '../../../services/inquiry/inquiry-document/inquiry-document.service';
import { PlanningReviewDocumentDto } from '../../../services/planning-review/planning-review-document/planning-review-document.dto';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DOCUMENT_SYSTEM } from '../../../shared/document/document.dto';
import { DocumentUploadDialogComponent } from './document-upload-dialog/document-upload-dialog.component';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../shared/constants';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'actions'];
  documents: InquiryDocumentDto[] = [];
  private fileId = '';

  DOCUMENT_SYSTEM = DOCUMENT_SYSTEM;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<InquiryDocumentDto> = new MatTableDataSource<InquiryDocumentDto>();

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;
  
  constructor(
    private planningReviewDocumentService: InquiryDocumentService,
    private inquiryDetailService: InquiryDetailService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.inquiryDetailService.$inquiry.subscribe((inquiry) => {
      if (inquiry) {
        this.fileId = inquiry.fileNumber;
        this.loadDocuments(inquiry.fileNumber);
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
    await this.planningReviewDocumentService.download(uuid, fileName);
  }

  async downloadFile(uuid: string, fileName: string) {
    await this.planningReviewDocumentService.download(uuid, fileName, false);
  }

  private async loadDocuments(fileNumber: string) {
    this.documents = await this.planningReviewDocumentService.listAll(fileNumber);
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

  onEditFile(element: PlanningReviewDocumentDto) {
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

  onDeleteFile(element: PlanningReviewDocumentDto) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected file?',
      })
      .subscribe(async (accepted) => {
        if (accepted) {
          await this.planningReviewDocumentService.delete(element.uuid);
          this.loadDocuments(this.fileId);
          this.toastService.showSuccessToast('Document deleted');
        }
      });
  }
}
