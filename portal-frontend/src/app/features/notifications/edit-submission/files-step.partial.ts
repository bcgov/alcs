import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { StepComponent } from './step.partial';

@Component({
  selector: 'app-file-step',
  template: '<p></p>',
  styleUrls: [],
})
export abstract class FilesStepComponent extends StepComponent {
  @Input() $noiDocuments!: BehaviorSubject<NoticeOfIntentDocumentDto[]>;

  DOCUMENT_TYPE = DOCUMENT_TYPE;

  protected fileId = '';

  protected abstract save(): Promise<void>;

  protected constructor(
    protected noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    protected dialog: MatDialog
  ) {
    super();
  }

  async attachFile(file: FileHandle, documentType: DOCUMENT_TYPE | null) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;
      await this.noticeOfIntentDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      const documents = await this.noticeOfIntentDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$noiDocuments.next(documents);
      }
    }
  }

  async onDeleteFile($event: NoticeOfIntentDocumentDto) {
    await this.noticeOfIntentDocumentService.deleteExternalFile($event.uuid);
    if (this.fileId) {
      const documents = await this.noticeOfIntentDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$noiDocuments.next(documents);
      }
    }
  }

  async openFile(uuid: string) {
    const res = await this.noticeOfIntentDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
