import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { NotificationTransfereeDto } from '../../../../services/notification-transferee/notification-transferee.dto';
import { NotificationTransfereeService } from '../../../../services/notification-transferee/notification-transferee.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { EditNotificationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';
import { TransfereeDialogComponent } from './transferee-dialog/transferee-dialog.component';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { VISIBLE_COUNT_INCREMENT } from '../../../../shared/constants';

@Component({
  selector: 'app-transferees',
  templateUrl: './transferees.component.html',
  styleUrls: ['./transferees.component.scss'],
})
export class TransfereesComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditNotificationSteps.Transferees;

  transferees: NotificationTransfereeDto[] = [];
  isDirty = false;
  displayedColumns: string[] = ['type', 'fullName', 'organizationName', 'phone', 'email', 'actions'];

  private submissionUuid = '';
  isMobile = false;
  visibleCount = VISIBLE_COUNT_INCREMENT;

  constructor(
    private notificationTransfereeService: NotificationTransfereeService,
    private notificationSubmissionService: NotificationSubmissionService,
    private confDialogService: ConfirmationDialogService,
    private dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      if (submission) {
        this.submissionUuid = submission.uuid;
        this.transferees = submission.transferees;
      }
    });
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  protected async save() {
    //Do Nothing
  }

  private async loadTransferees(submissionUuid: string, primaryContactOwnerUuid?: string | null) {
    const submission = await this.notificationSubmissionService.getByUuid(submissionUuid);
    if (submission) {
      this.transferees = submission.transferees;
      this.$notificationSubmission.next(submission);
    }
  }

  onAdd() {
    this.dialog
      .open(TransfereeDialogComponent, {
        data: {
          submissionUuid: this.submissionUuid,
        },
      })
      .beforeClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.loadTransferees(this.submissionUuid);
        }
      });
  }

  onEdit(uuid: string) {
    const selectedTransferee = this.transferees.find((transferee) => transferee.uuid === uuid);
    this.dialog
      .open(TransfereeDialogComponent, {
        data: {
          submissionUuid: this.submissionUuid,
          existingTransferee: selectedTransferee,
        },
      })
      .beforeClosed()
      .subscribe((didSave) => {
        if (didSave) {
          this.loadTransferees(this.submissionUuid);
        }
      });
  }

  async onDelete(uuid: string) {
    const selectedTransferee = this.transferees.find((transferee) => transferee.uuid === uuid);
    this.confDialogService
      .openDialog({
        title: 'Remove Transferee',
        body: `This action will remove ${selectedTransferee?.firstName} ${selectedTransferee?.lastName} and its usage from the entire notification of SRW. Are you sure you want to remove this transferee? `,
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          await this.notificationTransfereeService.delete(uuid);
          await this.loadTransferees(this.submissionUuid);
        }
      });
  }

  async increaseVisibleCount() {
    if (this.transferees.length - this.visibleCount >= VISIBLE_COUNT_INCREMENT) {
      this.visibleCount += VISIBLE_COUNT_INCREMENT;
    } else {
      this.visibleCount += this.transferees.length - this.visibleCount;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
