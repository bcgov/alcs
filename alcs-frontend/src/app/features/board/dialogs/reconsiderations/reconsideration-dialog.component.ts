import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationReconsiderationDto } from '../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { RECON_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-recon-detail-dialog',
  templateUrl: './reconsideration-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class ReconsiderationDialogComponent extends CardDialogComponent implements OnInit, OnDestroy {
  selectedRegion?: string;
  title?: string;
  reconType = RECON_TYPE_LABEL;
  cardTitle = '';

  recon: ApplicationReconsiderationDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationReconsiderationDto,
    private dialogRef: MatDialogRef<ReconsiderationDialogComponent>,
    private router: Router,
    private reconService: ApplicationReconsiderationService,
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
    this.populateData(this.data);
    super.ngOnInit();

    this.title = this.recon.application.fileNumber;
  }

  populateData(recon: ApplicationReconsiderationDto) {
    this.recon = recon;
    this.populateCardData(recon.card);
    this.selectedRegion = recon.application.region.code;
    this.cardTitle = `${recon.application.fileNumber} (${recon.application.applicant})`;
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.recon.card.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Reconsideration moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadReconsideration();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  private async reloadReconsideration() {
    const reconsideration = await this.reconService.fetchByCardUuid(this.recon.card.uuid);
    if (reconsideration) {
      this.populateData(reconsideration);
    }
  }
}
