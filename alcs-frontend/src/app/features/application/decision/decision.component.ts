import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeTypeDto,
  CeoCriterionDto,
  DecisionMakerDto,
} from '../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../services/application/application-decision/application-decision.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { DecisionDialogComponent } from './decision-dialog/decision-dialog.component';

@Component({
  selector: 'app-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
})
export class DecisionComponent implements OnInit {
  fileNumber: string = '';
  decisionDate: number | undefined;
  decisions: ApplicationDecisionDto[] = [];
  outcomes: ApplicationDecisionOutcomeTypeDto[] = [];
  decisionMakers: DecisionMakerDto[] = [];
  ceoCriterion: CeoCriterionDto[] = [];

  constructor(
    public dialog: MatDialog,
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.decisionDate = application.decisionDate;
        this.loadDecisions(application.fileNumber);
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    const codes = await this.decisionService.fetchCodes();
    this.decisions = await this.decisionService.fetchByApplication(fileNumber);
    this.outcomes = codes.outcomes;
    this.decisionMakers = codes.decisionMakers;
    this.ceoCriterion = codes.ceoCriterion;
  }

  onCreate() {
    let minDate = new Date(0);
    if (this.decisions.length > 0) {
      minDate = new Date(this.decisions[this.decisions.length - 1].date);
    }

    this.dialog
      .open(DecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          minDate,
          fileNumber: this.fileNumber,
          outcomes: this.outcomes,
          decisionMakers: this.decisionMakers,
          ceoCriterion: this.ceoCriterion,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.applicationDetailService.loadApplication(this.fileNumber);
        }
      });
  }

  onEdit(decision: ApplicationDecisionDto) {
    const decisionIndex = this.decisions.indexOf(decision);
    let minDate = new Date(0);
    if (decisionIndex !== this.decisions.length - 1) {
      minDate = new Date(this.decisions[this.decisions.length - 1].date);
    }
    this.dialog
      .open(DecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          minDate,
          fileNumber: this.fileNumber,
          outcomes: this.outcomes,
          decisionMakers: this.decisionMakers,
          ceoCriterion: this.ceoCriterion,
          existingDecision: decision,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.applicationDetailService.loadApplication(this.fileNumber);
        }
      });
  }

  async deleteDecision(uuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected decision?',
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          await this.decisionService.delete(uuid);
          await this.applicationDetailService.loadApplication(this.fileNumber);
          this.toastService.showSuccessToast('Decision deleted');
        }
      });
  }

  async attachFile(decisionUuid: string, event: Event) {
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      const uploadedFile = await this.decisionService.uploadFile(decisionUuid, file);
      if (uploadedFile) {
        await this.loadDecisions(this.fileNumber);
      }
    }
  }

  async downloadFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    await this.decisionService.downloadFile(decisionUuid, decisionDocumentUuid, fileName, false);
  }

  async openFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    await this.decisionService.downloadFile(decisionUuid, decisionDocumentUuid, fileName);
  }

  async deleteFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete the file ${fileName}?`,
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          await this.decisionService.deleteFile(decisionUuid, decisionDocumentUuid);
          await this.loadDecisions(this.fileNumber);
          this.toastService.showSuccessToast('File deleted');
        }
      });
  }

  async onSaveChairReviewDate(decisionUuid: string, chairReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      chairReviewDate: formatDateForApi(chairReviewDate),
      chairReviewRequired: true,
    });
    await this.loadDecisions(this.fileNumber);
  }

  async onSaveAuditDate(decisionUuid: string, auditReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      auditDate: formatDateForApi(auditReviewDate),
    });
    await this.loadDecisions(this.fileNumber);
  }
}
