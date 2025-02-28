import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDocumentDto } from '../../../services/planning-review/planning-review-document/planning-review-document.dto';
import { PlanningReviewDocumentService } from '../../../services/planning-review/planning-review-document/planning-review-document.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DOCUMENT_SYSTEM } from '../../../shared/document/document.dto';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../shared/constants';
import { DocumentUploadDialogComponent } from '../../../shared/document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  displayedColumns: string[] = ['source', 'type', 'fileName', 'visibilityFlags', 'uploadedAt', 'actions'];
  documents: PlanningReviewDocumentDto[] = [];
  private fileId = '';

  DOCUMENT_SYSTEM = DOCUMENT_SYSTEM;
  hasBeenSetForDiscussion = false;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<PlanningReviewDocumentDto> = new MatTableDataSource<PlanningReviewDocumentDto>();

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  constructor(
    private planningReviewDocumentService: PlanningReviewDocumentService,
    private planningReviewDetailService: PlanningReviewDetailService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.subscribe((planningReview) => {
      if (planningReview) {
        this.fileId = planningReview.fileNumber;
        this.loadDocuments(planningReview.fileNumber);
        this.hasBeenSetForDiscussion = planningReview.meetings.length > 0;
      }
    });
  }

  async onUploadFile() {
    const data: DocumentUploadDialogData = {
      ...DOCUMENT_UPLOAD_DIALOG_OPTIONS,
      ...{
        fileId: this.fileId,
        documentService: this.planningReviewDocumentService,
      },
    };

    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileId: this.fileId,
          documentService: this.planningReviewDocumentService,
          allowedVisibilityFlags: ['C'],
          allowsFileEdit: true,
        },
      })
      .afterClosed()
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
    const data: DocumentUploadDialogData = {
      ...DOCUMENT_UPLOAD_DIALOG_OPTIONS,
      ...{
        allowsFileEdit: element.system === DOCUMENT_SYSTEM.ALCS,
        fileId: this.fileId,
        existingDocument: element,
        documentService: this.planningReviewDocumentService,
      },
    };

    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileId: this.fileId,
          existingDocument: element,
          documentService: this.planningReviewDocumentService,
          allowsFileEdit: true,
          allowedVisibilityFlags: ['C'],
        },
      })
      .afterClosed()
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
