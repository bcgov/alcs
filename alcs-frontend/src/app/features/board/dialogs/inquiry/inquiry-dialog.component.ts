import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { InquiryDto } from '../../../../services/inquiry/inquiry.dto';
import { InquiryService } from '../../../../services/inquiry/inquiry.service';
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
    selector: 'app-inquiry-detail-dialog',
    templateUrl: './inquiry-dialog.component.html',
    styleUrls: ['../card-dialog/card-dialog.component.scss'],
    standalone: false
})
export class InquiryDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  title?: string;
  planningType?: ApplicationPill;
  cardTitle = '';
  OPEN_TYPE = OPEN_PR_LABEL;
  CLOSED_TYPE = CLOSED_PR_LABEL;

  inquiry: InquiryDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InquiryDto,
    dialogRef: MatDialogRef<InquiryDialogComponent>,
    boardService: BoardService,
    userService: UserService,
    authService: AuthenticationService,
    toastService: ToastService,
    private inquiryService: InquiryService,
    confirmationDialogService: ConfirmationDialogService,
    cardService: CardService,
    private router: Router,
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.inquiry = this.data;
    this.planningType = {
      ...this.data.type,
      borderColor: this.data.type.backgroundColor,
    };
    this.populateCardData(this.data.card!);

    this.selectedRegion = this.data.region.code;
    this.cardTitle = `${this.data.fileNumber} (${this.data.inquirerLastName ?? 'Unknown'})`;

    this.title = this.data.fileNumber;
  }

  private async reload() {
    const inquiry = await this.inquiryService.fetchByCardUuid(this.inquiry.card!.uuid);
    if (inquiry && inquiry.card) {
      await this.populateCardData(inquiry.card);
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.inquiry.card!.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Inquiry moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reload();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }
}
