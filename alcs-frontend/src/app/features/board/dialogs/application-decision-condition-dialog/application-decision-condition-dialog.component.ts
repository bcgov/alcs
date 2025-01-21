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
import { BoardService } from '../../../../services/board/board.service';
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
  isModification: boolean = false;
  isReconsideration: boolean = false;

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<{ condition: ApplicationDecisionConditionDto; index: string; selected: boolean }> =
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
      this.decision = decision;
    }
  }

  loadTableData(filterSelected: boolean = false) {
    const data = this.decision.conditions.map((condition, index) => ({
      condition,
      index: countToString(index + 1),
      selected: this.isConditionSelected(condition),
    }));

    filterSelected ? (this.dataSource.data = data.filter((item) => item.selected)) : (this.dataSource.data = data);
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
      return condition.dates![0].date ? this.formatTimestamp(condition.dates![0].date) : null;
    } else {
      if (condition.dates && condition.dates.length > 0) {
        let minDueDate: ApplicationDecisionConditionDateDto | null = null;
        let maxDueDate: ApplicationDecisionConditionDateDto | null = null;

        for (const date of condition.dates) {
          if (!maxDueDate || date.date! > maxDueDate.date!) {
            maxDueDate = date;
          }
          if (!date.completedDate) {
            if (!minDueDate || date.date! < minDueDate.date!) {
              minDueDate = date;
            }
          }
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
}
