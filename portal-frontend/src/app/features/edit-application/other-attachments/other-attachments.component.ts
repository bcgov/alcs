import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  ApplicationDocumentUpdateDto,
  DOCUMENT,
} from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';

@Component({
  selector: 'app-other-attachments',
  templateUrl: './other-attachments.component.html',
  styleUrls: ['./other-attachments.component.scss'],
})
export class OtherAttachmentsComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
  $destroy = new Subject<void>();

  displayedColumns = ['type', 'description', 'fileName', 'actions'];
  selectableTypes = [DOCUMENT.PHOTOGRAPH, DOCUMENT.PROFESSIONAL_REPORT, DOCUMENT.OTHER];
  otherFiles: ApplicationDocumentDto[] = [];
  fileId: string | undefined;

  private isDirty = false;

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private applicationDocumentService: ApplicationDocumentService
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.otherFiles = application.documents.sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });
      }
    });
  }

  async onSaveExit() {
    if (this.fileId) {
      await this.onSave();
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  async attachFile(file: FileHandle) {
    if (this.fileId) {
      await this.applicationDocumentService.attachExternalFile(this.fileId, file.file, null);
      const updatedApp = await this.applicationService.getByFileId(this.fileId);
      this.$application.next(updatedApp);
    }
  }

  async onRemoveFile(uuid: any) {
    if (this.fileId) {
      await this.applicationDocumentService.deleteExternalFile(uuid);
      const updatedApp = await this.applicationService.getByFileId(this.fileId);
      this.$application.next(updatedApp);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  async onSave() {
    if (this.isDirty) {
      const updateDtos: ApplicationDocumentUpdateDto[] = this.otherFiles.map((file) => ({
        uuid: file.uuid,
        description: file.description,
        type: file.type,
      }));
      await this.applicationDocumentService.update(this.fileId, updateDtos);
    }
  }

  onChangeDescription(uuid: string, event: Event) {
    this.isDirty = true;
    const input = event.target as HTMLInputElement;
    const description = input.value;
    this.otherFiles = this.otherFiles.map((file) => {
      if (uuid === file.uuid) {
        file.description = description;
      }
      return file;
    });
  }

  onChangeType(uuid: string, selectedValue: DOCUMENT) {
    this.isDirty = true;
    const type = selectedValue;
    this.otherFiles = this.otherFiles.map((file) => {
      if (uuid === file.uuid) {
        file.type = type;
      }
      return file;
    });
  }
}
