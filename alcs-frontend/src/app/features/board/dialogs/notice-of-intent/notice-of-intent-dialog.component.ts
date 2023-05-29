import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../../services/notice-of-intent/notice-of-intent.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-notice-of-intent-dialog',
  templateUrl: './notice-of-intent-dialog.component.html',
  styleUrls: ['./notice-of-intent-dialog.component.scss'],
})
export class NoticeOfIntentDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  title?: string;
  cardTitle = '';

  noticeOfIntent: NoticeOfIntentDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NoticeOfIntentDto,
    private dialogRef: MatDialogRef<NoticeOfIntentDialogComponent>,
    private noticeOfIntentService: NoticeOfIntentService,
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
    super.populateCardDate(noticeOfIntent.card);
    this.selectedRegion = noticeOfIntent.region.code;
    this.userService.fetchAssignableUsers();
    this.cardTitle = `${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`;
  }

  private async reload() {
    const noticeOfIntent = await this.noticeOfIntentService.fetchByCardUuid(this.noticeOfIntent.card.uuid);
    if (noticeOfIntent) {
      this.populateData(noticeOfIntent);
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.noticeOfIntent.card.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
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
