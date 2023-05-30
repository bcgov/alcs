import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { PlanningReviewDto } from '../../../../services/planning-review/planning-review.dto';
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
    confirmationDialogService: ConfirmationDialogService,
    cardService: CardService
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.planningReview = this.data;
    this.populateCardDate(this.data.card);

    this.selectedRegion = this.data.region.code;
    this.cardTitle = `${this.data.fileNumber} (${this.data.type})`;

    this.title = this.planningReview.fileNumber;
  }
}
