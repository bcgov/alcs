import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatestWith, Subject, takeUntil, tap } from 'rxjs';
import { ApplicationAmendmentDto } from '../../../services/application/application-amendment/application-amendment.dto';
import { ApplicationAmendmentService } from '../../../services/application/application-amendment/application-amendment.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationReconsiderationDetailedDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { EditAmendmentDialogComponent } from './edit-amendment-dialog/edit-amendment-dialog.component';
import { EditReconsiderationDialogComponent } from './edit-reconsideration-dialog/edit-reconsideration-dialog.component';

@Component({
  selector: 'app-post-decision',
  templateUrl: './post-decision.component.html',
  styleUrls: ['./post-decision.component.scss'],
})
export class PostDecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  fileNumber: string = '';
  reconsiderations: ApplicationReconsiderationDetailedDto[] = [];
  amendments: ApplicationAmendmentDto[] = [];
  reconCodes: BaseCodeDto[] = [];

  constructor(
    public dialog: MatDialog,
    private applicationDetailService: ApplicationDetailService,
    private applicationReconsiderationService: ApplicationReconsiderationService,
    private amendmentService: ApplicationAmendmentService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application
      .pipe(
        tap(() => {
          this.applicationReconsiderationService.fetchCodes();
        })
      )
      .pipe(
        combineLatestWith(
          this.applicationReconsiderationService.$reconsiderations,
          this.applicationReconsiderationService.$codes,
          this.amendmentService.$amendments
        )
      )
      .pipe(takeUntil(this.$destroy))
      .subscribe(([application, reconsiderations, reconCodes, amendments]) => {
        if (application) {
          this.fileNumber = application.fileNumber;
          this.reconsiderations = reconsiderations ?? [];
          this.reconCodes = reconCodes;
          this.amendments = amendments;
        }
      });
  }

  onEditReconsideration(reconsideration: ApplicationReconsiderationDetailedDto) {
    this.dialog
      .open(EditReconsiderationDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          fileNumber: this.fileNumber,
          existingDecision: reconsideration,
          codes: this.reconCodes,
        },
      })
      .afterClosed()
      .subscribe((wasModified) => {
        if (wasModified) {
          this.applicationDetailService.loadApplication(this.fileNumber);
        }
      });
  }

  onEditAmendment(amendment: ApplicationAmendmentDto) {
    this.dialog
      .open(EditAmendmentDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          fileNumber: this.fileNumber,
          existingAmendment: amendment,
        },
      })
      .afterClosed()
      .subscribe((wasModified) => {
        if (wasModified) {
          this.applicationDetailService.loadApplication(this.fileNumber);
        }
      });
  }

  async deleteReconsideration(uuid: string, reconsiderationIndex: number) {
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

  async deleteAmendment(uuid: string, index: number) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete Amendment Request #${index}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.amendmentService.delete(uuid);
          await this.amendmentService.fetchByApplication(this.fileNumber);
          this.toastService.showSuccessToast('Amendment request deleted');
        }
      });
  }

  async onSaveReconsiderationReviewDate(reconsiderationUuid: string, reviewDate: number) {
    await this.applicationReconsiderationService.update(reconsiderationUuid, {
      reviewDate: formatDateForApi(reviewDate),
    });
    await this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
  }

  async onSaveReconsiderationReviewOutcome(reconsiderationUuid: string, isReviewApproved: boolean) {
    await this.applicationReconsiderationService.update(reconsiderationUuid, {
      isReviewApproved,
    });
    await this.applicationReconsiderationService.fetchByApplication(this.fileNumber);
  }

  async onSaveAmendmentReviewDate(uuid: string, reviewDate: number) {
    await this.amendmentService.update(uuid, {
      reviewDate: formatDateForApi(reviewDate),
    });
    await this.amendmentService.fetchByApplication(this.fileNumber);
  }

  async onSaveAmendmentOutcome(uuid: string, isReviewApproved: boolean) {
    await this.amendmentService.update(uuid, {
      isReviewApproved,
    });
    await this.amendmentService.fetchByApplication(this.fileNumber);
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

  goToRecons() {
    const el = document.getElementById('recons');
    if (el) {
      el.scrollIntoView();
    }
  }

  goToAmendments() {
    const el = document.getElementById('amendments');
    if (el) {
      el.scrollIntoView();
    }
  }
}
