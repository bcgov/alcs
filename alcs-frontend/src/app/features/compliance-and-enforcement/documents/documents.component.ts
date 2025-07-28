import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ComplianceAndEnforcementDocumentDto } from '../../../services/compliance-and-enforcement/documents/document.dto';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../shared/constants';
import { DOCUMENT_SYSTEM } from '../../../shared/document/document.dto';
import {
  DocumentUploadDialogData,
  DocumentUploadDialogOptions,
} from '../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DocumentUploadDialogComponent } from '../../../shared/document-upload-dialog/document-upload-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  ComplianceAndEnforcementDocumentService,
  Section,
} from '../../../services/compliance-and-enforcement/documents/document.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-compliance-and-enforcement-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class ComplianceAndEnforcementDocumentsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  isPatching = false;
  isSubscribed = false;

  @Input() title?: string;
  @Input() fileNumber?: string;
  @Input() options?: DocumentUploadDialogOptions;
  @Input() section?: Section;

  displayedColumns: string[] = ['source', 'type', 'fileName', 'uploadedAt', 'actions'];

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<ComplianceAndEnforcementDocumentDto> =
    new MatTableDataSource<ComplianceAndEnforcementDocumentDto>();

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;
  readonly documentSystem = DOCUMENT_SYSTEM;

  constructor(
    public dialog: MatDialog,
    private readonly documentService: ComplianceAndEnforcementDocumentService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  openEditDialog(document: ComplianceAndEnforcementDocumentDto) {
    if (!this.fileNumber) {
      console.error('File number is required to open the upload dialog.');
      return;
    }

    const data: DocumentUploadDialogData = {
      ...this.options,
      ...{
        fileId: this.fileNumber,
        existingDocument: document,
        documentService: this.documentService,
        section: this.section,
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
          this.loadDocuments();
        }
      });
  }

  deleteFile(document: ComplianceAndEnforcementDocumentDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${document.fileName}?`,
      })
      .subscribe(async (accepted) => {
        if (accepted) {
          await this.documentService.delete(document.uuid);

          this.toastService.showSuccessToast('Document deleted');

          this.loadDocuments();
        }
      });
  }

  openUploadDialog() {
    if (!this.fileNumber) {
      console.error('File number is required to open the upload dialog.');
      return;
    }

    const data: DocumentUploadDialogData = {
      ...this.options,
      ...{
        documentService: this.documentService,
        fileId: this.fileNumber,
        section: this.section,
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
          this.loadDocuments();
        }
      });
  }

  async loadDocuments() {
    if (this.fileNumber) {
      const documents = await this.documentService.list(this.fileNumber, this.section);
      this.dataSource.data = documents;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
