import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import {
  PlanningReviewDecisionDocumentDto,
  PlanningReviewDecisionDto,
} from '../../../../services/planning-review/planning-review-decision/planning-review-decision.dto';
import { PlanningReviewDecisionService } from '../../../../services/planning-review/planning-review-decision/planning-review-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../../shared/constants';
import { DocumentUploadDialogComponent } from '../../../../shared/document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-decision-documents',
  templateUrl: './decision-documents.component.html',
  styleUrls: ['./decision-documents.component.scss'],
})
export class DecisionDocumentsComponent implements OnDestroy, OnChanges {
  $destroy = new Subject<void>();

  @Input() editable = true;
  @Input() loadData = true;
  @Input() decision: PlanningReviewDecisionDto | undefined;
  @Input() showError = false;
  @Output() beforeDocumentUpload = new EventEmitter<boolean>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'visibilityFlags', 'uploadedAt', 'actions'];
  private fileId = '';

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<PlanningReviewDecisionDocumentDto> =
    new MatTableDataSource<PlanningReviewDecisionDocumentDto>();

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  constructor(
    private decisionService: PlanningReviewDecisionService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  async openFile(fileUuid: string, fileName: string) {
    if (this.decision) {
      await this.decisionService.downloadFile(this.decision.uuid, fileUuid, fileName);
    }
  }

  async downloadFile(fileUuid: string, fileName: string) {
    if (this.decision) {
      await this.decisionService.downloadFile(this.decision.uuid, fileUuid, fileName, false);
    }
  }

  async onUploadFile() {
    this.beforeDocumentUpload.emit();
    this.openFileDialog();
  }

  onEditFile(element: PlanningReviewDecisionDocumentDto) {
    this.openFileDialog(element);
  }

  private openFileDialog(existingDocument?: PlanningReviewDecisionDocumentDto) {
    if (this.decision) {
      this.dialog
        .open(DocumentUploadDialogComponent, {
          minWidth: '600px',
          maxWidth: '800px',
          width: '70%',
          data: {
            fileId: this.fileId,
            decisionUuid: this.decision?.uuid,
            existingDocument: existingDocument,
            decisionService: this.decisionService,
          },
        })
        .beforeClosed()
        .subscribe((isDirty: boolean) => {
          if (isDirty && this.decision) {
            this.decisionService.loadDecision(this.decision.uuid);
          }
        });
    }
  }

  onDeleteFile(element: PlanningReviewDecisionDocumentDto) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected file?',
      })
      .subscribe(async (accepted) => {
        if (accepted && this.decision) {
          await this.decisionService.deleteFile(this.decision.uuid, element.uuid);
          await this.decisionService.loadDecision(this.decision.uuid);
          this.toastService.showSuccessToast('Document deleted');
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnChanges(): void {
    if (this.decision) {
      this.dataSource = new MatTableDataSource(this.decision.documents);
    }
  }
}
