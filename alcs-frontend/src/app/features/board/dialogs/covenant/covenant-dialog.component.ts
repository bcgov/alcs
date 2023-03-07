import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { CovenantDto } from '../../../../services/covenant/covenant.dto';
import { CovenantService } from '../../../../services/covenant/covenant.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { COVENANT_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-covenant-dialog',
  templateUrl: './covenant-dialog.component.html',
  styleUrls: ['./covenant-dialog.component.scss'],
})
export class CovenantDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  title?: string;
  covenantType = COVENANT_TYPE_LABEL;
  cardTitle = '';

  covenant: CovenantDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CovenantDto,
    private dialogRef: MatDialogRef<CovenantDialogComponent>,
    private covenantService: CovenantService,
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

    this.title = `${this.covenant.fileNumber} (${this.covenant.applicant})`;
  }

  populateData(covenant: CovenantDto) {
    this.covenant = covenant;
    super.populateCardDate(covenant.card);
    this.selectedRegion = covenant.region.code;
    this.userService.fetchAssignableUsers();
    this.cardTitle = `${covenant.fileNumber} (${covenant.applicant})`;
  }

  private async reloadCovenant() {
    const covenant = await this.covenantService.fetchByCardUuid(this.covenant.card.uuid);
    if (covenant) {
      this.populateData(covenant);
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.covenant.card.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Covenant moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadCovenant();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }
}
