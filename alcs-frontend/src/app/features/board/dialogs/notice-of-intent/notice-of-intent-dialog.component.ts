import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  ApplicationSubmissionToSubmissionStatusDto,
  DEFAULT_NO_STATUS,
} from '../../../../services/application/application-submission-status/application-submission-status.dto';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { NoticeOfIntentSubmissionStatusService } from '../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import {
  NoticeOfIntentDto,
  NoticeOfIntentSubmissionToSubmissionStatusDto,
} from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../../services/notice-of-intent/notice-of-intent.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { ApplicationSubmissionStatusPill } from '../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { RETROACTIVE_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-notice-of-intent-dialog',
  templateUrl: './notice-of-intent-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class NoticeOfIntentDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  title?: string;
  cardTitle = '';
  status?: ApplicationSubmissionStatusPill;

  noticeOfIntent: NoticeOfIntentDto = this.data;
  RETROACTIVE_TYPE = RETROACTIVE_TYPE_LABEL;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NoticeOfIntentDto,
    private dialogRef: MatDialogRef<NoticeOfIntentDialogComponent>,
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private router: Router,
    boardService: BoardService,
    userService: UserService,
    authService: AuthenticationService,
    toastService: ToastService,
    confirmationDialogService: ConfirmationDialogService,
    cardService: CardService
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.populateData(this.data);

    this.title = `${this.noticeOfIntent.fileNumber} (${this.noticeOfIntent.applicant})`;
  }

  populateData(noticeOfIntent: NoticeOfIntentDto) {
    this.noticeOfIntent = noticeOfIntent;
    super.populateCardData(noticeOfIntent.card);
    this.selectedRegion = noticeOfIntent.region.code;
    this.userService.fetchAssignableUsers();
    this.cardTitle = `${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`;
    this.populateSubmissionStatus(noticeOfIntent.fileNumber);
  }

  private async reload() {
    const noticeOfIntent = await this.noticeOfIntentService.fetchByCardUuid(this.noticeOfIntent.card.uuid);
    if (noticeOfIntent) {
      this.populateData(noticeOfIntent);
    }
  }

  private async populateSubmissionStatus(fileNumber: string) {
    let submissionStatus: NoticeOfIntentSubmissionToSubmissionStatusDto | null = null;

    try {
      submissionStatus = await this.noticeOfIntentSubmissionStatusService.fetchCurrentStatusByFileNumber(
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
      await this.boardService.changeBoard(this.noticeOfIntent.card.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Notice of Intent moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reload();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }
}
