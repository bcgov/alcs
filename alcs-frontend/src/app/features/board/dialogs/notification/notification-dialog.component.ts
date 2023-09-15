import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DEFAULT_NO_STATUS } from '../../../../services/application/application-submission-status/application-submission-status.dto';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { NotificationSubmissionStatusService } from '../../../../services/notification/notification-submission-status/notification-submission-status.service';
import {
  NotificationDto,
  NotificationSubmissionToSubmissionStatusDto,
} from '../../../../services/notification/notification.dto';
import { NotificationService } from '../../../../services/notification/notification.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { ApplicationSubmissionStatusPill } from '../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class NotificationDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  cardTitle = '';

  notification: NotificationDto = this.data;
  status?: ApplicationSubmissionStatusPill;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NotificationDto,
    private dialogRef: MatDialogRef<NotificationDialogComponent>,
    private notificationService: NotificationService,
    private router: Router,
    userService: UserService,
    confirmationDialogService: ConfirmationDialogService,
    boardService: BoardService,
    toastService: ToastService,
    cardService: CardService,
    authService: AuthenticationService,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.populateData(this.data);
  }

  populateData(notification: NotificationDto) {
    this.notification = notification;
    this.populateCardData(notification.card!);
    this.selectedRegion = notification.region?.code;
    this.cardTitle = `${notification.fileNumber} (${notification.applicant})`;
    this.populateSubmissionStatus(this.notification.fileNumber);
  }

  async populateSubmissionStatus(fileNumber: string) {
    let submissionStatus: NotificationSubmissionToSubmissionStatusDto | null = null;

    try {
      submissionStatus = await this.notificationSubmissionStatusService.fetchCurrentStatusByFileNumber(
        fileNumber,
        false
      );
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    if (submissionStatus) {
      this.status = {
        backgroundColor: submissionStatus.status.alcsBackgroundColor,
        textColor: submissionStatus.status.alcsColor,
        label: submissionStatus.status.label,
      };
    } else {
      this.status = DEFAULT_NO_STATUS;
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.notification.card!.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Application moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadNotification();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  async reloadNotification() {
    const notification = await this.notificationService.fetchByFileNumber(this.notification.fileNumber);
    if (notification) {
      this.populateData(notification);
    }
  }
}
