import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { NotificationDocumentDto } from '../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../services/notification-document/notification-document.service';
import { DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { StepComponent } from './step.partial';

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
    protected dialog: MatDialog
  ) {
    super();
  }

  async attachFile(file: FileHandle, documentType: DOCUMENT_TYPE | null) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;
      await this.notificationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      const documents = await this.notificationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$notificationDocuments.next(documents);
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

  async openFile(uuid: string) {
    const res = await this.notificationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
