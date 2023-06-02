import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import {
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
} from '../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { DecisionDialogComponent } from './decision-dialog/decision-dialog.component';

type LoadingDecision = NoticeOfIntentDecisionDto & {
  loading: boolean;
};

@Component({
  selector: 'app-noi-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
})
export class DecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  fileNumber: string = '';
  decisionDate: number | undefined;
  decisions: LoadingDecision[] = [];
  outcomes: NoticeOfIntentDecisionOutcomeCodeDto[] = [];
  isPaused = true;

  noticeOfIntent: NoticeOfIntentDto | undefined;

  constructor(
    public dialog: MatDialog,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private decisionService: NoticeOfIntentDecisionService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.$destroy)).subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.fileNumber = noticeOfIntent.fileNumber;
        this.decisionDate = noticeOfIntent.decisionDate;
        this.isPaused = noticeOfIntent.paused;
        this.loadDecisions(noticeOfIntent.fileNumber);
        this.noticeOfIntent = noticeOfIntent;
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    const codes = await this.decisionService.fetchCodes();
    this.outcomes = codes.outcomes;

    const loadedDecision = await this.decisionService.fetchByFileNumber(fileNumber);

    this.decisions = loadedDecision.map((decision) => ({
      ...decision,
      loading: false,
    }));
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
        autoFocus: false,
        data: {
          isFirstDecision: this.decisions.length === 0,
          minDate,
          fileNumber: this.fileNumber,
          outcomes: this.outcomes,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.noticeOfIntentDetailService.load(this.fileNumber);
        }
      });
  }

  onEdit(decision: LoadingDecision) {
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
        autoFocus: false,
        data: {
          isFirstDecision: decisionIndex === this.decisions.length - 1,
          minDate,
          fileNumber: this.fileNumber,
          outcomes: this.outcomes,
          existingDecision: decision,
        },
      })
      .afterClosed()
      .subscribe((didModify) => {
        if (didModify) {
          this.noticeOfIntentDetailService.load(this.fileNumber);
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
          this.decisions = this.decisions.map((decision) => {
            return {
              ...decision,
              loading: decision.uuid === uuid,
            };
          });
          await this.decisionService.delete(uuid);
          await this.noticeOfIntentDetailService.load(this.fileNumber);
          this.toastService.showSuccessToast('Decision deleted');
        }
      });
  }

  async attachFile(decisionUuid: string, event: Event) {
    this.decisions = this.decisions.map((decision) => {
      return {
        ...decision,
        loading: decision.uuid === decisionUuid,
      };
    });
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
          this.decisions = this.decisions.map((decision) => {
            return {
              ...decision,
              loading: decision.uuid === decisionUuid,
            };
          });

          await this.decisionService.deleteFile(decisionUuid, decisionDocumentUuid);
          await this.loadDecisions(this.fileNumber);
          this.toastService.showSuccessToast('File deleted');
        }
      });
  }

  async onSaveAuditDate(decisionUuid: string, auditReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      auditDate: formatDateForApi(auditReviewDate),
    });
    await this.loadDecisions(this.fileNumber);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
