import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
  ApplicationDocumentUpdateDto,
  DOCUMENT_TYPE,
} from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../services/code/code.service';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../edit-application.component';

const USER_CONTROLLED_TYPES = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

@Component({
  selector: 'app-other-attachments',
  templateUrl: './other-attachments.component.html',
  styleUrls: ['./other-attachments.component.scss'],
})
export class OtherAttachmentsComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() showErrors = false;
  @Output() navigateToStep = new EventEmitter<number>();
  $destroy = new Subject<void>();
  currentStep = EditApplicationSteps.Attachments;

  displayedColumns = ['type', 'description', 'fileName', 'actions'];
  selectableTypes: ApplicationDocumentTypeDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];
  fileId: string | undefined;

  private isDirty = false;

  form = new FormGroup({} as any);
  private documentCodes: ApplicationDocumentTypeDto[] = [];

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    private codeService: CodeService
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
      }
    });

    this.loadDocumentCodes();

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.otherFiles = documents
        .filter((file) => (file.type ? USER_CONTROLLED_TYPES.includes(file.type.code) : true))
        .sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });
      const newForm = new FormGroup({});
      for (const file of this.otherFiles) {
        newForm.addControl(`${file.uuid}-type`, new FormControl(file.type?.code, [Validators.required]));
        newForm.addControl(`${file.uuid}-description`, new FormControl(file.description, [Validators.required]));
      }
      this.form = newForm;
      if (this.showErrors) {
        this.form.markAllAsTouched();
      }
    });
  }

  async onSaveExit() {
    if (this.fileId) {
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  async attachFile(file: FileHandle) {
    if (this.fileId) {
      await this.onSave();
      await this.applicationDocumentService.attachExternalFile(this.fileId, file.file, null);
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async onRemoveFile(uuid: any) {
    if (this.fileId) {
      await this.onSave();
      await this.applicationDocumentService.deleteExternalFile(uuid);
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async ngOnDestroy() {
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
        type: file.type?.code ?? null,
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

  onChangeType(uuid: string, selectedValue: DOCUMENT_TYPE) {
    this.isDirty = true;
    this.otherFiles = this.otherFiles.map((file) => {
      if (uuid === file.uuid) {
        const newType = this.documentCodes.find((code) => code.code === selectedValue);
        if (newType) {
          file.type = newType;
        } else {
          console.error('Failed to find matching document type');
        }
      }
      return file;
    });
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.applicationDocumentTypes;
    this.selectableTypes = this.documentCodes.filter((code) => USER_CONTROLLED_TYPES.includes(code.code));
  }
}
