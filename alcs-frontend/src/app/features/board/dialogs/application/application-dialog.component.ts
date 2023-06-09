import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './application-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class ApplicationDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  cardTitle = '';

  application: ApplicationDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDto,
    private dialogRef: MatDialogRef<ApplicationDialogComponent>,
    private applicationService: ApplicationService,
    private router: Router,
    userService: UserService,
    confirmationDialogService: ConfirmationDialogService,
    boardService: BoardService,
    toastService: ToastService,
    cardService: CardService,
    authService: AuthenticationService
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.populateData(this.data);
  }

  populateData(application: ApplicationDto) {
    this.application = application;
    this.populateCardData(application.card!);
    this.selectedRegion = application.region.code;
    this.cardTitle = `${application.fileNumber} (${application.applicant})`;
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.application.card!.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Application moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadApplication();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  async reloadApplication() {
    const application = await this.applicationService.fetchApplication(this.application.fileNumber);
    this.populateData(application);
  }

  override updateCard(changes: Omit<CardUpdateDto, 'uuid'>) {
    if (this.card) {
      this.applicationService
        .updateApplicationCard(this.card.uuid, {
          ...changes,
        })
        .then(() => {
          this.isDirty = true;
          this.toastService.showSuccessToast('Card updated');
        });
    }
  }
}
