import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDecisionDocumentDto } from '../../../../../services/application/decision/application-decision-v1/application-decision.dto';
import { ApplicationDecisionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionDocumentUploadDialogComponent } from '../decision-input/decision-file-upload-dialog/decision-document-upload-dialog.component';

@Component({
  selector: 'app-decision-documents',
  templateUrl: './decision-documents.component.html',
  styleUrls: ['./decision-documents.component.scss'],
})
export class DecisionDocumentsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() editable = true;
  @Input() loadData = true;
  @Input() decision: ApplicationDecisionDto | undefined;
  @Input() showError = false;
  @Output() beforeDocumentUpload = new EventEmitter<boolean>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'visibilityFlags', 'uploadedAt', 'actions'];
  documents: ApplicationDecisionDocumentDto[] = [];
  private fileId = '';
  areDocumentsReleased = false;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<ApplicationDecisionDocumentDto> =
    new MatTableDataSource<ApplicationDecisionDocumentDto>();

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private dialog: MatDialog,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    if (this.decision && !this.loadData) {
      this.dataSource = new MatTableDataSource(this.decision.documents);
      this.areDocumentsReleased = !this.decision.isDraft && !!this.decision.date && Date.now() >= this.decision.date;
    }
    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      if (decision) {
        this.dataSource = new MatTableDataSource(decision.documents);
        this.decision = decision;
        this.areDocumentsReleased = !decision.isDraft && !!decision.date && Date.now() >= decision.date;
      }
    });
  }

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

  onEditFile(element: ApplicationDecisionDocumentDto) {
    this.openFileDialog(element);
  }

  private openFileDialog(existingDocument?: ApplicationDecisionDocumentDto) {
    if (this.decision) {
      this.dialog
        .open(DecisionDocumentUploadDialogComponent, {
          minWidth: '600px',
          maxWidth: '800px',
          width: '70%',
          data: {
            fileId: this.fileId,
            decisionUuid: this.decision?.uuid,
            existingDocument: existingDocument,
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

  onDeleteFile(element: ApplicationDecisionDocumentDto) {
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
}
