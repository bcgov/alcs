import { Component, Input } from '@angular/core';
import { ApplicationDocumentDto } from '../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_TYPE,
} from '../../services/application/application-document/application-document.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-document[title][documentType][fileNumber]',
  templateUrl: './application-document.component.html',
  styleUrls: ['./application-document.component.scss'],
})
export class ApplicationDocumentComponent {
  @Input() documentType: DOCUMENT_TYPE = 'decisionDocument';
  @Input() title = '';
  @Input() readOnly = false;

  _fileNumber: string = '';
  @Input() set fileNumber(fileNumber: string) {
    if (fileNumber) {
      this._fileNumber = fileNumber;
      this.loadDocuments();
    }
  }

  isUploading = false;

  displayedColumns: string[] = ['fileName', 'uploadedAt', 'uploadedBy', 'action'];
  documents: ApplicationDocumentDto[] = [];

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  async loadDocuments() {
    this.documents = await this.applicationDocumentService.list(this._fileNumber, this.documentType);
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

  async uploadFile(event: Event) {
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      this.isUploading = true;
      const uploadedFile = await this.applicationDocumentService.upload(this._fileNumber, this.documentType, file);
      if (uploadedFile) {
        await this.loadDocuments();
      }
      this.isUploading = false;
    }
  }
}
