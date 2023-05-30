import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationModificationDto } from '../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../services/application/application-modification/application-modification.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { MODIFICATION_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-modification-detail-dialog',
  templateUrl: './modification-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class ModificationDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  title?: string;
  modificationType = MODIFICATION_TYPE_LABEL;
  cardTitle = '';

  modification: ApplicationModificationDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationModificationDto,
    private dialogRef: MatDialogRef<ModificationDialogComponent>,
    private modificationService: ApplicationModificationService,
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

    this.title = this.modification.application.fileNumber;
  }

  populateData(modification: ApplicationModificationDto) {
    this.modification = modification;
    super.populateCardData(modification.card);
    this.selectedRegion = modification.application.region.code;
    this.cardTitle = `${modification.application.fileNumber} (${modification.application.applicant})`;
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.data.card.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
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
    const res = await this.modificationService.fetchByCardUuid(this.modification.card.uuid);
    if (res) {
      this.modification = res;
    }
  }
}
