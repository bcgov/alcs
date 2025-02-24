import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  ApplicationSubmissionToSubmissionStatusDto,
  DEFAULT_NO_STATUS,
} from '../../../../services/application/application-submission-status/application-submission-status.dto';
import { SUBMISSION_STATUS } from '../../../../services/application/application.dto';
import { ApplicationSubmissionStatusService } from '../../../../services/application/application-submission-status/application-submission-status.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { ApplicationSubmissionStatusPill } from '../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { APPLICATION_ROUTER_LINK_BASE } from '../../../../shared/constants';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './application-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss'],
})
export class ApplicationDialogComponent extends CardDialogComponent implements OnInit {
  selectedRegion?: string;
  cardTitle = '';

  application: ApplicationDto = this.data;
  status?: ApplicationSubmissionStatusPill;

  routerLink = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDto,
    private applicationService: ApplicationService,
    private router: Router,
    dialogRef: MatDialogRef<ApplicationDialogComponent>,
    userService: UserService,
    confirmationDialogService: ConfirmationDialogService,
    boardService: BoardService,
    toastService: ToastService,
    cardService: CardService,
    authService: AuthenticationService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
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
    this.selectedRegion = application.region?.code;
    this.cardTitle = `${application.fileNumber} (${application.applicant})`;
    this.populateApplicationSubmissionStatus(this.application.fileNumber);
  }

  async populateApplicationSubmissionStatus(fileNumber: string) {
    let submissionStatus: ApplicationSubmissionToSubmissionStatusDto | null = null;
    this.routerLink = `${APPLICATION_ROUTER_LINK_BASE}/${fileNumber}`;
    try {
      submissionStatus = await this.applicationSubmissionStatusService.fetchCurrentStatusByFileNumber(
        fileNumber,
        false,
      );
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    if (submissionStatus) {
      if (submissionStatus.statusTypeCode === SUBMISSION_STATUS.ALC_DECISION) {
        this.routerLink = `${APPLICATION_ROUTER_LINK_BASE}/${fileNumber}/decision`;
      }
      this.status = {
        backgroundColor: submissionStatus.status.alcsBackgroundColor,
        textColor: submissionStatus.status.alcsColor,
        label: submissionStatus.status.label,
      };
    } else {
      this.status = DEFAULT_NO_STATUS;
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.application.card!.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
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
