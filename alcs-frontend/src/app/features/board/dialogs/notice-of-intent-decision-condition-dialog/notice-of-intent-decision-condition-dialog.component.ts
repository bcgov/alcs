import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import {
  NoticeOfIntentDecisionConditionCardBoardDto,
  NoticeOfIntentDecisionConditionDateDto,
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionDto,
  UpdateNoticeOfIntentDecisionConditionCardDto,
} from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NoticeOfIntentDecisionV2Service } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecisionConditionCardService } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { CardService } from '../../../../services/card/card.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { Router } from '@angular/router';
import {
  CONDITION_LABEL,
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_EXPIRED_LABEL,
  DECISION_CONDITION_ONGOING_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
  DECISION_CONDITION_PENDING_LABEL,
  MODIFICATION_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-notice-of-intent-decision-condition-dialog',
  templateUrl: './notice-of-intent-decision-condition-dialog.component.html',
  styleUrls: [
    '../card-dialog/card-dialog.component.scss',
    './notice-of-intent-decision-condition-dialog.component.scss',
  ],
})
export class NoticeOfIntentDecisionConditionDialogComponent extends CardDialogComponent implements OnInit {
  cardTitle = '';
  noticeOfIntent: NoticeOfIntentDto = this.data.noticeOfIntent;
  decision!: NoticeOfIntentDecisionDto;
  noticeOfIntentDecisionConditionCard: NoticeOfIntentDecisionConditionCardBoardDto = this.data.decisionConditionCard;
  isModification: boolean = false;
  isReconsideration: boolean = false;
  isFlagged = false;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<{ condition: NoticeOfIntentDecisionConditionDto; index: number; selected: boolean }> =
    new MatTableDataSource();

  editColumns: string[] = ['select', 'condition', 'date', 'status'];
  defaultColumns: string[] = ['condition', 'date', 'status'];

  displayColumns: string[] = this.defaultColumns;

  isEditing: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      decisionConditionCard: NoticeOfIntentDecisionConditionCardBoardDto;
      noticeOfIntent: NoticeOfIntentDto;
    },
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionV2Service,
    private noticeOfIntentDecisionConditionCardService: NoticeOfIntentDecisionConditionCardService,
    dialogRef: MatDialogRef<NoticeOfIntentDecisionConditionDialogComponent>,
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

    this.populateCardData(this.noticeOfIntentDecisionConditionCard.card);
    this.cardTitle = `${this.noticeOfIntent.fileNumber} (${this.noticeOfIntent.applicant})`;

    this.loadTableData(true);
  }

  async loadDecision() {
    const decision = await this.noticeOfIntentDecisionService.getByUuid(
      this.noticeOfIntentDecisionConditionCard.decisionUuid,
      true,
    );
    if (decision) {
      this.decision = decision;
      this.isFlagged = this.decision.isFlagged;
    }
  }

  loadTableData(filterSelected: boolean = false) {
    const data = this.decision.conditions
      .filter((condition) => !filterSelected || this.isConditionSelected(condition))
      .map((condition, index) => ({
        condition,
        index: index + 1,
        selected: this.isConditionSelected(condition),
      }));

    this.dataSource.data = data;
  }

  isConditionSelected(condition: NoticeOfIntentDecisionConditionDto): boolean {
    return condition.conditionCard?.uuid === this.noticeOfIntentDecisionConditionCard.uuid;
  }

  isConditionDisabled(condition: NoticeOfIntentDecisionConditionDto): boolean {
    if (condition.conditionCard === null) {
      return false;
    }
    return condition.conditionCard?.uuid !== this.noticeOfIntentDecisionConditionCard.uuid;
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

  getDate(condition: NoticeOfIntentDecisionConditionDto) {
    if (condition.type!.dateType === 'Single') {
      return condition.dates![0].date ? this.formatTimestamp(condition.dates![0].date) : null;
    } else {
      if (condition.dates && condition.dates.length > 0) {
        let minDueDate: NoticeOfIntentDecisionConditionDateDto | null = null;
        let maxDueDate: NoticeOfIntentDecisionConditionDateDto | null = null;
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
    const updateDto: UpdateNoticeOfIntentDecisionConditionCardDto = {
      conditionsUuids: selectedConditions,
    };

    const res = await this.noticeOfIntentDecisionConditionCardService.update(
      this.noticeOfIntentDecisionConditionCard.uuid,
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
      await this.boardService.changeBoard(this.noticeOfIntentDecisionConditionCard.card!.uuid, board.code);
      const loadedBoard = await this.boardService.fetchBoardDetail(board.code);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`NOI Condition moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadApplicationCondition();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  async reloadApplicationCondition() {
    const noticeOfIntentDecisionConditionCard = await this.noticeOfIntentDecisionConditionCardService.getByCard(
      this.noticeOfIntentDecisionConditionCard.card.uuid,
    );
    this.noticeOfIntentDecisionConditionCard = noticeOfIntentDecisionConditionCard!;
    this.populateData();
  }
}
