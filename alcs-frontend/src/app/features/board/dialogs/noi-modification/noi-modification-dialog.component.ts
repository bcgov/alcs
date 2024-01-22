import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { NoticeOfIntentModificationDto } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import {
  MODIFICATION_TYPE_LABEL,
  RETROACTIVE_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-modification-detail-dialog',
  templateUrl: './noi-modification-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class NoiModificationDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  title?: string;
  MODIFICATION_TYPE = MODIFICATION_TYPE_LABEL;
  RETROACTIVE_TYPE = RETROACTIVE_TYPE_LABEL;
  cardTitle = '';

  modification: NoticeOfIntentModificationDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NoticeOfIntentModificationDto,
    private dialogRef: MatDialogRef<NoiModificationDialogComponent>,
    private modificationService: NoticeOfIntentModificationService,
    private router: Router,
    userService: UserService,
    cardService: CardService,
    boardService: BoardService,
    toastService: ToastService,
    confirmationDialogService: ConfirmationDialogService,
    authService: AuthenticationService
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.populateData(this.data);

    this.title = this.modification.noticeOfIntent.fileNumber;
  }

  populateData(modification: NoticeOfIntentModificationDto) {
    this.modification = modification;
    super.populateCardData(modification.card);
    this.selectedRegion = modification.noticeOfIntent.region.code;
    this.cardTitle = `${modification.noticeOfIntent.fileNumber} (${modification.noticeOfIntent.applicant})`;
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.data.card.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Modification moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reload();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  private async reload() {
    const modification = await this.modificationService.fetchByCardUuid(this.modification.card.uuid);
    if (modification) {
      this.modification = modification;
    }
  }
}
