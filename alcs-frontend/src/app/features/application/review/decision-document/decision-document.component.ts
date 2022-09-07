import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ApplicationDocumentDto } from '../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-decision-document',
  templateUrl: './decision-document.component.html',
  styleUrls: ['./decision-document.component.scss'],
})
export class DecisionDocumentComponent implements OnInit {
  @Input() fileNumber = '';

  isUploading = false;

  dateFormat = environment.dateFormat;
  displayedColumns: string[] = ['fileName', 'uploadedAt', 'uploadedBy', 'action'];
  documents: ApplicationDocumentDto[] = [];

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  async loadDocuments() {
    this.documents = await this.applicationDocumentService.list(this.fileNumber);
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
    await this.applicationDocumentService.download(uuid, fileName);
  }

  async uploadFile(event: Event) {
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      this.isUploading = true;
      const uploadedFile = await this.applicationDocumentService.upload(this.fileNumber, file);
      if (uploadedFile) {
        await this.loadDocuments();
      }
      this.isUploading = false;
    }
  }
}
