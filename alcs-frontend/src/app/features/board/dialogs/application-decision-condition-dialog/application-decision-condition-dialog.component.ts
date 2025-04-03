import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionConditionCardBoardDto,
  ApplicationDecisionConditionDateDto,
  ApplicationDecisionConditionDto,
  ApplicationDecisionDto,
  UpdateApplicationDecisionConditionCardDto,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { CardService } from '../../../../services/card/card.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { ApplicationDecisionConditionCardService } from '../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { countToString } from '../../../../shared/utils/count-to-string';
import {
  CONDITION_LABEL,
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_EXPIRED_LABEL,
  DECISION_CONDITION_ONGOING_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
  DECISION_CONDITION_PENDING_LABEL,
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-decision-condition-dialog',
  templateUrl: './application-decision-condition-dialog.component.html',
  styleUrls: ['../card-dialog/card-dialog.component.scss', './application-decision-condition-dialog.component.scss'],
})
export class ApplicationDecisionConditionDialogComponent extends CardDialogComponent implements OnInit {
  cardTitle = '';
  application: ApplicationDto = this.data.application;
  decision: ApplicationDecisionDto | undefined;
  applicationDecisionConditionCard: ApplicationDecisionConditionCardBoardDto = this.data.decisionConditionCard;
  isModification: boolean = false;
  isReconsideration: boolean = false;
  isOrderNull = false;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<{ condition: ApplicationDecisionConditionDto; index: number; selected: boolean }> =
    new MatTableDataSource();

  editColumns: string[] = ['select', 'condition', 'date', 'status'];
  defaultColumns: string[] = ['condition', 'date', 'status'];

  displayColumns: string[] = this.defaultColumns;

  isEditing: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      decisionConditionCard: ApplicationDecisionConditionCardBoardDto;
      application: ApplicationDto;
    },
    private applicationDecisionService: ApplicationDecisionV2Service,
    private applicationDecisionConditionCardService: ApplicationDecisionConditionCardService,
    dialogRef: MatDialogRef<ApplicationDecisionConditionDialogComponent>,
    userService: UserService,
    confirmationDialogService: ConfirmationDialogService,
    boardService: BoardService,
    toastService: ToastService,
    cardService: CardService,
    authService: AuthenticationService,
    private router: Router,
  ) {
    super(authService, dialogRef, cardService, confirmationDialogService, toastService, userService, boardService);
  }
  override ngOnInit(): void {
    super.ngOnInit();
    this.populateData();
  }

  async populateData() {
    await this.loadDecision();

    this.populateCardData(this.applicationDecisionConditionCard.card);
    this.cardTitle = `${this.application.fileNumber} (${this.application.applicant})`;

    this.loadTableData(true);
  }

  async loadDecision() {
    const decision = await this.applicationDecisionService.getByUuid(
      this.applicationDecisionConditionCard.decisionUuid,
      true,
    );
    if (decision) {
      const orderIndexes = decision.conditions.map((c) => c.order);
      this.isOrderNull = decision.conditions.length > 1 && orderIndexes.every((val, i, arr) => val === arr[0] && arr[0] === 0);
      this.decision = decision;
    }
  }

  loadTableData(filterSelected: boolean = false) {
    if (!this.decision) {
      return;
    }

    const data = this.decision.conditions
      .filter((condition) => !filterSelected || this.isConditionSelected(condition))
      .map((condition, index) => ({
        condition,
        index: index + 1,
        selected: this.isConditionSelected(condition),
      }))
      .sort((a, b) => {
        return a.condition.order - b.condition.order
      });
    this.dataSource.data = data;
  }

  isConditionSelected(condition: ApplicationDecisionConditionDto): boolean {
    return condition.conditionCard?.uuid === this.applicationDecisionConditionCard.uuid;
  }

  isConditionDisabled(condition: ApplicationDecisionConditionDto): boolean {
    if (condition.conditionCard === null) {
      return false;
    }
    return condition.conditionCard?.uuid !== this.applicationDecisionConditionCard.uuid;
  }

  getStatusPill(status: string) {
    if (status === 'ONGOING') {
      return DECISION_CONDITION_ONGOING_LABEL;
    } else if (status === 'COMPLETED') {
      return DECISION_CONDITION_COMPLETE_LABEL;
    } else if (status === 'PASTDUE') {
      return DECISION_CONDITION_PASTDUE_LABEL;
    } else if (status === 'PENDING') {
      return DECISION_CONDITION_PENDING_LABEL;
    } else if (status === 'EXPIRED') {
      return DECISION_CONDITION_EXPIRED_LABEL;
    } else if (status === 'MODIFICATION') {
      return MODIFICATION_TYPE_LABEL;
    } else if (status === 'RECONSIDERATION') {
      return RECON_TYPE_LABEL;
    } else if (status === 'CONDITION') {
      return CONDITION_LABEL;
    } else {
      return DECISION_CONDITION_ONGOING_LABEL;
    }
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-CA', options).replace(',', '');
    const [month, day, year] = formattedDate.split(' ');
    return `${year}-${month}-${day}`;
  }

  getDate(condition: ApplicationDecisionConditionDto) {
    if (condition.type!.dateType === 'Single') {
      if (!condition.dates || condition.dates?.length <= 0) {
        return null;
      }
      return condition.dates[0].date ? this.formatTimestamp(condition.dates[0].date) : null;
    } else {
      if (condition.dates && condition.dates.length > 0) {
        let minDueDate: ApplicationDecisionConditionDateDto | null = null;
        let maxDueDate: ApplicationDecisionConditionDateDto | null = null;
        let allDatesNull = true;

        for (const date of condition.dates) {
          if (date.date !== null) {
            allDatesNull = false;
            if (!maxDueDate || date.date! > maxDueDate.date!) {
              maxDueDate = date;
            }
            if (!date.completedDate) {
              if (!minDueDate || date.date! < minDueDate.date!) {
                minDueDate = date;
              }
            }
          }
        }

        if (allDatesNull) {
          return null;
        }

        const selectedDate = minDueDate || maxDueDate;
        return selectedDate ? this.formatTimestamp(selectedDate.date!) : null;
      }
      return null;
    }
  }

  editClicked() {
    this.isEditing = true;
    this.displayColumns = this.editColumns;
    this.loadTableData();
  }

  onCancel() {
    this.isEditing = false;
    this.displayColumns = this.defaultColumns;

    this.loadTableData(true);
  }

  async onSave() {
    const selectedConditions = this.dataSource.data.filter((item) => item.selected).map((item) => item.condition.uuid);
    const updateDto: UpdateApplicationDecisionConditionCardDto = {
      conditionsUuids: selectedConditions,
    };

    const res = await this.applicationDecisionConditionCardService.update(
      this.applicationDecisionConditionCard.uuid,
      updateDto,
    );
    res
      ? this.toastService.showSuccessToast('Condition card updated successfully')
      : this.toastService.showErrorToast('Failed to update condition card');

    this.isEditing = false;
    this.displayColumns = this.defaultColumns;
    this.isDirty = true;

    await this.loadDecision();
    this.loadTableData(true);
  }

  isSaveDisabled(): boolean {
    return !this.dataSource.data.some((item) => item.selected);
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.applicationDecisionConditionCard.card!.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Application Condition moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadApplicationCondition();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  async reloadApplicationCondition() {
    const applicationDecisionConditionCard = await this.applicationDecisionConditionCardService.getByCard(
      this.applicationDecisionConditionCard.card.uuid,
    );
    this.applicationDecisionConditionCard = applicationDecisionConditionCard!;
    this.populateData();
  }

  alphaIndex(index: number) {
    return countToString(index);
  }
}
