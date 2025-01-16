import { Component, Inject, OnInit } from '@angular/core';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionConditionCardBoardDto,
  ApplicationDecisionDto,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { BoardService } from '../../../../services/board/board.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { CardService } from '../../../../services/card/card.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { ApplicationDecisionConditionCardService } from '../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';
import { ApplicationDto } from '../../../../services/application/application.dto';

@Component({
  selector: 'app-application-decision-condition-dialog',
  templateUrl: './application-decision-condition-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss', './application-decision-condition-dialog.component.scss'],
})
export class ApplicationDecisionConditionDialogComponent extends CardDialogComponent implements OnInit {
  cardTitle = '';
  application: ApplicationDto = this.data.application;
  decision!: ApplicationDecisionDto;
  applicationDecisionConditionCard: ApplicationDecisionConditionCardBoardDto = this.data.decisionConditionCard;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      decisionConditionCard: ApplicationDecisionConditionCardBoardDto;
      application: ApplicationDto;
    },
    private applicationService: ApplicationService,
    private applicationDecisionService: ApplicationDecisionV2Service,
    private applicationDecisionConditionCardService: ApplicationDecisionConditionCardService,
    private router: Router,
    dialogRef: MatDialogRef<ApplicationDecisionConditionDialogComponent>,
    userService: UserService,
    confirmationDialogService: ConfirmationDialogService,
    boardService: BoardService,
    toastService: ToastService,
    cardService: CardService,
    authService: AuthenticationService,
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }
  override ngOnInit(): void {
    console.log(this.data);
    super.ngOnInit();
    this.populateData();
  }

  async populateData() {
    const decision = await this.applicationDecisionService.getByUuid(
      this.applicationDecisionConditionCard.decisionUuid,
      true,
    );
    if (decision) {
      this.decision = decision;
    }

    this.populateCardData(this.applicationDecisionConditionCard.card);
    this.cardTitle = `${this.application.fileNumber} (${this.application.applicant})`;
  }
}
