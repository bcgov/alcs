import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatestWith, Subject, takeUntil, tap } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationReconsiderationDetailedDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { PostDecisionDialogComponent } from './post-decision-dialog/post-decision-dialog.component';

@Component({
  selector: 'app-post-decision',
  templateUrl: './post-decision.component.html',
  styleUrls: ['./post-decision.component.scss'],
})
export class PostDecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  fileNumber: string = '';
  postDecisions: ApplicationReconsiderationDetailedDto[] = [];
  codes: BaseCodeDto[] = [];

  constructor(
    public dialog: MatDialog,
    private applicationDetailService: ApplicationDetailService,
    private applicationReconsiderationService: ApplicationReconsiderationService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application
      .pipe(
        tap((application) => {
          if (application) {
            this.applicationReconsiderationService.fetchByApplication(application.fileNumber);
          }
          this.applicationReconsiderationService.fetchCodes();
        })
      )
      .pipe(
        combineLatestWith(
          this.applicationReconsiderationService.$reconsiderations,
          this.applicationReconsiderationService.$codes
        )
      )
      .pipe(takeUntil(this.$destroy))
      .subscribe(([application, reconsiderations, codes]) => {
        if (application) {
          this.fileNumber = application.fileNumber;
          this.postDecisions = reconsiderations ?? [];
          this.codes = codes;
        }
      });
  }

  onEdit(reconsideration: ApplicationReconsiderationDetailedDto) {
    this.dialog
      .open(PostDecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          fileNumber: this.fileNumber,
          existingDecision: reconsideration,
          codes: this.codes,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.applicationDetailService.loadApplication(this.fileNumber);
        }
      });
  }

  async deletePostDecision(uuid: string, reconsiderationIndex: number) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete Reconsideration Request #${reconsiderationIndex}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.applicationReconsiderationService.delete(uuid);
          await this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
          this.toastService.showSuccessToast('Reconsideration request deleted');
        }
      });
  }

  async onSaveReviewDate(reconsiderationUuid: string, reviewDate: number) {
    await this.applicationReconsiderationService.update(reconsiderationUuid, {
      reviewDate: formatDateForApi(reviewDate),
    });
    await this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
  }

  async onSaveReviewOutcome(reconsiderationUuid: string, isReviewApproved: boolean) {
    await this.applicationReconsiderationService.update(reconsiderationUuid, {
      isReviewApproved,
    });
    await this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
  }

  getReviewOutcomeLabel(reviewOutcome: boolean) {
    return reviewOutcome ? 'Proceed' : 'Refused';
  }

  isReviewOutcomeSet(reviewOutcome?: boolean | null) {
    return typeof reviewOutcome === 'boolean';
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
