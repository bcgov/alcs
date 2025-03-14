import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { NotificationDocumentDto } from '../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../services/notification-document/notification-document.service';
import { ToastService } from '../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { StepComponent } from './step.partial';
import { openFileInline } from '../../../shared/utils/file';

@Component({
  selector: 'app-file-step',
  template: '<p></p>',
  styleUrls: [],
})
export abstract class FilesStepComponent extends StepComponent {
  @Input() $notificationDocuments!: BehaviorSubject<NotificationDocumentDto[]>;

  DOCUMENT_TYPE = DOCUMENT_TYPE;

  protected fileId = '';

  protected abstract save(): Promise<void>;

  protected constructor(
    protected notificationDocumentService: NotificationDocumentService,
    protected dialog: MatDialog,
    protected toastService: ToastService
  ) {
    super();
  }

  async attachFile(file: FileHandle, documentType: DOCUMENT_TYPE | null) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;

      try {
        const res = await this.notificationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);

        if (res) {
          this.toastService.showSuccessToast('Document uploaded');
          const documents = await this.notificationDocumentService.getByFileId(this.fileId);
          if (documents) {
            this.$notificationDocuments.next(documents);
          }
        }
      } catch (err) {
        this.toastService.showErrorToast('Document upload failed');

        throw err;
      }
    }
  }

  //Using ApplicationDocumentDto is "correct" here, quack quack
  async onDeleteFile($event: ApplicationDocumentDto) {
    await this.notificationDocumentService.deleteExternalFile($event.uuid);
    if (this.fileId) {
      const documents = await this.notificationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$notificationDocuments.next(documents);
      }
    }
  }

  async openFile(file: ApplicationDocumentDto) {
    const res = await this.notificationDocumentService.openFile(file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }
  
  async refreshFiles() {
    const documents = await this.notificationDocumentService.getByFileId(this.fileId);
    if (documents) {
      this.$notificationDocuments.next(documents);
    }
  }
}
