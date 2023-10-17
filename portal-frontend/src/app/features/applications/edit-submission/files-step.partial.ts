import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ToastService } from '../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { RemoveFileConfirmationDialogComponent } from '../alcs-edit-submission/remove-file-confirmation-dialog/remove-file-confirmation-dialog.component';
import { StepComponent } from './step.partial';

@Component({
  selector: 'app-file-step',
  template: '<p></p>',
  styleUrls: [],
})
export abstract class FilesStepComponent extends StepComponent {
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;

  DOCUMENT_TYPE = DOCUMENT_TYPE;

  protected fileId = '';

  protected abstract save(): Promise<void>;

  protected constructor(
    protected applicationDocumentService: ApplicationDocumentService,
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
        await this.applicationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      } catch (err) {
        this.toastService.showErrorToast('Document upload failed');
        if (err instanceof HttpErrorResponse && err.status === 403) {
          return false;
        }
      }

      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
    return true;
  }

  async onDeleteFile($event: ApplicationDocumentDto) {
    if (this.draftMode) {
      this.dialog
        .open(RemoveFileConfirmationDialogComponent)
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            this.deleteFile($event);
          }
        });
    } else {
      await this.deleteFile($event);
    }
  }

  private async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationDocumentService.deleteExternalFile($event.uuid);
    if (this.fileId) {
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
