import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { DocumentUploadDialogComponent } from './document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent {
  displayedColumns: string[] = ['type', 'name', 'source', 'visibility', 'uploadDate', 'actions'];
  documents: ApplicationDocumentDto[] = [];
  private fileId = '';

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private applicationDetailService: ApplicationDetailService,
    public dialog: MatDialog
  ) {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.loadDocuments(application.fileNumber);
      }
    });
  }

  async onUploadFile() {
    this.dialog.open(DocumentUploadDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        fileId: this.fileId,
      },
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
}
