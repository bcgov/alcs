import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDecisionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ApplicationDecisionDocumentDto } from '../../../../../services/application/decision/application-decision-v2/application-decision.dto';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DocumentUploadDialogComponent } from '../../../../../shared/document-upload-dialog/document-upload-dialog.component';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../../../shared/constants';

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
  @Input() hiddenFromPortal = false;
  @Output() beforeDocumentUpload = new EventEmitter<boolean>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'visibilityFlags', 'uploadedAt', 'actions'];
  documents: ApplicationDecisionDocumentDto[] = [];
  areDocumentsReleased = false;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<ApplicationDecisionDocumentDto> =
    new MatTableDataSource<ApplicationDecisionDocumentDto>();
  private fileId = '';
  
  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private dialog: MatDialog,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    if (this.decision && !this.loadData) {
      this.dataSource = new MatTableDataSource(this.decision.documents);
      this.areDocumentsReleased =
        !this.hiddenFromPortal && !this.decision.isDraft && !!this.decision.date && Date.now() >= this.decision.date;
    }
    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      if (decision) {
        this.dataSource = new MatTableDataSource(decision.documents);
        this.decision = decision;
        this.areDocumentsReleased =
          !this.hiddenFromPortal && !decision.isDraft && !!decision.date && Date.now() >= decision.date;
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

  private openFileDialog(existingDocument?: ApplicationDecisionDocumentDto) {
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
}
