import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { PlanningReviewDto } from '../../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../../services/planning-review/planning-review.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { PLANNING_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './planning-review-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class PlanningReviewDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  title?: string;
  planningType = PLANNING_TYPE_LABEL;
  cardTitle = '';

  planningReview: PlanningReviewDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PlanningReviewDto,
    private dialogRef: MatDialogRef<PlanningReviewDialogComponent>,
    boardService: BoardService,
    userService: UserService,
    authService: AuthenticationService,
    toastService: ToastService,
    private planningReviewService: PlanningReviewService,
    confirmationDialogService: ConfirmationDialogService,
    cardService: CardService,
    private router: Router
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.planningReview = this.data;
    this.populateCardData(this.data.card);

    this.selectedRegion = this.data.region.code;
    this.cardTitle = `${this.data.fileNumber} (${this.data.type})`;

    this.title = this.planningReview.fileNumber;
  }

  private async reload() {
    const planningReview = await this.planningReviewService.fetchByCardUuid(this.planningReview.card.uuid);
    if (planningReview) {
      this.populateCardData(planningReview.card);
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.planningReview.card.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Planning Review moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reload();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }
}
