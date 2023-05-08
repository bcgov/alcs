import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DecisionDocumentDto } from '../../../../../services/application/decision/application-decision-v1/application-decision.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionDocumentUploadDialogComponent } from '../decision-input/decision-file-upload-dialog/decision-document-upload-dialog.component';

@Component({
  selector: 'app-decision-documents',
  templateUrl: './decision-documents.component.html',
  styleUrls: ['./decision-documents.component.scss'],
})
export class DecisionDocumentsComponent implements OnInit {
  @Input() editable = true;

  displayedColumns: string[] = ['type', 'fileName', 'source', 'visibilityFlags', 'uploadedAt', 'actions'];
  documents: DecisionDocumentDto[] = [];
  private fileId = '';

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<DecisionDocumentDto> = new MatTableDataSource<DecisionDocumentDto>();
  private decisionUuid = '';

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private dialog: MatDialog,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.decisionService.$decision.subscribe((decision) => {
      if (decision) {
        this.dataSource = new MatTableDataSource(decision.documents);
        this.decisionUuid = decision.uuid;
      }
    });
  }

  async openFile(fileUuid: string, fileName: string) {
    await this.decisionService.downloadFile(this.decisionUuid, fileUuid, fileName);
  }

  async downloadFile(fileUuid: string, fileName: string) {
    await this.decisionService.downloadFile(this.decisionUuid, fileUuid, fileName, false);
  }

  async onUploadFile() {
    this.openFileDialog();
  }

  onEditFile(element: DecisionDocumentDto) {
    this.openFileDialog(element);
  }

  private openFileDialog(existingDocument?: DecisionDocumentDto) {
    this.dialog
      .open(DecisionDocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data: {
          fileId: this.fileId,
          decisionUuid: this.decisionUuid,
          existingDocument: existingDocument,
        },
      })
      .beforeClosed()
      .subscribe((isDirty: boolean) => {
        if (isDirty) {
          this.decisionService.loadDecision(this.decisionUuid);
        }
      });
  }

  onDeleteFile(element: DecisionDocumentDto) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected file?',
      })
      .subscribe(async (accepted) => {
        if (accepted) {
          await this.decisionService.deleteFile(this.decisionUuid, element.uuid);
          await this.decisionService.loadDecision(this.decisionUuid);
          this.toastService.showSuccessToast('Document deleted');
        }
      });
  }
}
