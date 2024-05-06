import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { PlanningReferralService } from '../../../../services/planning-review/planning-referral.service';
import { PlanningReferralDto, PlanningReviewDto } from '../../../../services/planning-review/planning-review.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { ApplicationPill } from '../../../../shared/application-type-pill/application-type-pill.component';
import {
  CLOSED_PR_LABEL,
  OPEN_PR_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
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
  planningType?: ApplicationPill;
  cardTitle = '';
  OPEN_TYPE = OPEN_PR_LABEL;
  CLOSED_TYPE = CLOSED_PR_LABEL;

  planningReview: PlanningReviewDto = this.data.planningReview;
  planningReferral: PlanningReferralDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PlanningReferralDto,
    dialogRef: MatDialogRef<PlanningReviewDialogComponent>,
    boardService: BoardService,
    userService: UserService,
    authService: AuthenticationService,
    toastService: ToastService,
    private planningReferralService: PlanningReferralService,
    confirmationDialogService: ConfirmationDialogService,
    cardService: CardService,
    private router: Router,
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.planningReview = this.data.planningReview;
    this.planningType = {
      ...this.data.planningReview.type,
      borderColor: this.data.planningReview.type.backgroundColor,
    };
    this.populateCardData(this.data.card!);

    this.selectedRegion = this.data.planningReview.region.code;
    this.cardTitle = `${this.data.planningReview.fileNumber} (${this.data.planningReview.documentName})`;

    this.title = this.planningReview.fileNumber;
  }

  private async reload() {
    const planningReferral = await this.planningReferralService.fetchByCardUuid(this.planningReferral.card!.uuid);
    if (planningReferral) {
      await this.populateCardData(planningReferral.card!);
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.planningReferral.card!.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
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
