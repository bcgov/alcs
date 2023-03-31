import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApplicationDocumentDto } from '../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_SOURCE,
} from '../../services/application/application-document/application-document.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-document[title][fileNumber][visibilityFlags]',
  templateUrl: './application-document.component.html',
  styleUrls: ['./application-document.component.scss'],
})
export class ApplicationDocumentComponent implements OnChanges {
  @Input() title = '';
  @Input() fileNumber: string = '';
  @Input() visibilityFlags: string[] = [];

  isUploading = false;

  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'action'];
  documents: ApplicationDocumentDto[] = [];

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadDocuments();
  }

  async loadDocuments() {
    if (this.fileNumber) {
      this.documents = await this.applicationDocumentService.listByVisibility(this.fileNumber, this.visibilityFlags);
    }
  }

  async onDelete(uuid: string, fileName: string) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${fileName}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.applicationDocumentService.delete(uuid);
          await this.loadDocuments();
        }
      });
  }

  async onDownload(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName, false);
  }

  async onOpen(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName);
  }
}
