import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import moment from 'moment';
import { NoticeOfIntentDecisionConditionService } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import {
  ConditionType,
  NoticeOfIntentDecisionConditionDateDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import {
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_ONGOING_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
  DECISION_CONDITION_PENDING_LABEL,
  DECISION_CONDITION_EXPIRED_LABEL,
} from '../../../../../shared/application-type-pill/application-type-pill.constants';
import { CONDITION_STATUS, ConditionComponentLabels, DecisionConditionWithStatus } from '../conditions.component';
import { environment } from '../../../../../../environments/environment';
import { DateType } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { countToString } from '../../../../../shared/utils/count-to-string';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';

type Condition = DecisionConditionWithStatus & {
  componentLabelsStr?: string;
  componentLabels?: ConditionComponentLabels[];
};

export interface NoticeOfIntentDecisionConditionDateWithIndex extends NoticeOfIntentDecisionConditionDateDto {
  index: number;
}

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss'],
})
export class ConditionComponent implements OnInit, AfterViewInit {
  @Input() condition!: Condition;
  @Input() isDraftDecision!: boolean;
  @Input() fileNumber!: string;
  @Input() index!: number;

  @Output() statusChange: EventEmitter<string> = new EventEmitter();

  DateType = DateType;

  dates: NoticeOfIntentDecisionConditionDateDto[] = [];

  statusLabel = DECISION_CONDITION_ONGOING_LABEL;

  singleDateLabel: string | undefined;
  showSingleDateField = false;
  showMultipleDateTable = false;
  showAdmFeeField = false;
  showSecurityAmountField = false;
  singleDateFormated: string | undefined = undefined;

  isThreeColumn = true;

  CONDITION_STATUS = CONDITION_STATUS;

  isReadMoreClicked = false;
  isReadMoreVisible = false;
  conditionStatus: string = '';
  stringIndex: string = '';

  isFinancialSecurity: boolean = false;

  displayColumns: string[] = ['index', 'due', 'completed', 'comment', 'action'];

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<NoticeOfIntentDecisionConditionDateWithIndex> =
    new MatTableDataSource<NoticeOfIntentDecisionConditionDateWithIndex>();

  constructor(
    private conditionService: NoticeOfIntentDecisionConditionService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  async ngOnInit() {
    this.stringIndex = countToString(this.index);
    if (this.condition) {
      this.dates = Array.isArray(this.condition.dates) ? this.condition.dates : [];
      if (this.condition.type?.dateType === DateType.SINGLE && this.dates.length <= 0) {
        await this.addNewDate();
      }
      this.singleDateFormated =
        this.dates[0] && this.dates[0].date ? moment(this.dates[0].date).format(environment.dateFormat) : undefined;
      this.setPillLabel(this.condition.status);
      this.singleDateLabel =
        this.condition.type?.dateType === DateType.SINGLE && this.condition.type?.singleDateLabel
          ? this.condition.type?.singleDateLabel
          : undefined;
      this.showSingleDateField = this.condition.type?.dateType === DateType.SINGLE;
      this.showMultipleDateTable = this.condition.type?.dateType === DateType.MULTIPLE;
      this.showAdmFeeField = this.condition.type?.isAdministrativeFeeAmountChecked
        ? this.condition.type?.isAdministrativeFeeAmountChecked
        : false;
      this.showSecurityAmountField = this.condition.type?.isSecurityAmountChecked
        ? this.condition.type?.isSecurityAmountChecked
        : false;
      this.condition = {
        ...this.condition,
        componentLabelsStr: this.condition.conditionComponentsLabels?.flatMap((e) => e.label).join(';\n'),
      };

      this.isThreeColumn = this.showAdmFeeField && this.showSecurityAmountField;
      this.dataSource = new MatTableDataSource<NoticeOfIntentDecisionConditionDateWithIndex>(
        this.addIndex(this.sortDates(this.dates)),
      );

      this.isFinancialSecurity = this.condition.type?.code === ConditionType.FINANCIAL_SECURITY;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => (this.isReadMoreVisible = this.checkIfReadMoreVisible()));
  }

  async onUpdateCondition(
    field: keyof UpdateNoticeOfIntentDecisionConditionDto,
    value: string[] | string | number | null,
  ) {
    const condition = this.condition;

    if (condition) {
      const update = await this.conditionService.update(condition.uuid, {
        [field]: value,
      });

      const labels = this.condition.componentLabelsStr;
      this.condition = { ...update, componentLabelsStr: labels } as Condition;
    }
  }

  onToggleReadMore() {
    this.isReadMoreClicked = !this.isReadMoreClicked;
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    // + 2 required as adjustment to height
    return el ? el.clientHeight + 2 < el.scrollHeight : false;
  }

  checkIfReadMoreVisible(): boolean {
    return this.isReadMoreClicked || this.isEllipsisActive(this.condition.uuid + 'Description');
  }

  private setPillLabel(status: string) {
    switch (status) {
      case 'ONGOING':
        this.statusLabel = DECISION_CONDITION_ONGOING_LABEL;
        break;
      case 'COMPLETED':
        this.statusLabel = DECISION_CONDITION_COMPLETE_LABEL;
        break;
      case 'PASTDUE':
        this.statusLabel = DECISION_CONDITION_PASTDUE_LABEL;
        break;
      case 'PENDING':
        this.statusLabel = DECISION_CONDITION_PENDING_LABEL;
        break;
      case 'EXPIRED':
        this.statusLabel = DECISION_CONDITION_EXPIRED_LABEL;
        break;
      default:
        this.statusLabel = DECISION_CONDITION_ONGOING_LABEL;
        break;
    }
  }

  addIndex(
    data: NoticeOfIntentDecisionConditionDateDto[],
  ): (NoticeOfIntentDecisionConditionDateDto & { index: number })[] {
    return data.map((item, i) => ({
      ...item,
      index: i + 1,
    }));
  }

  sortDates(data: NoticeOfIntentDecisionConditionDateDto[]): NoticeOfIntentDecisionConditionDateDto[] {
    return data.sort((a, b) => {
      if (a.date == null && b.date == null) return 0;
      if (a.date == null) return 1;
      if (b.date == null) return -1;

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  async addNewDate() {
    const newDate = await this.conditionService.createDate(this.condition.uuid);

    if (newDate) {
      this.dates.push(newDate);
      this.dataSource = new MatTableDataSource<NoticeOfIntentDecisionConditionDateWithIndex>(
        this.addIndex(this.sortDates(this.dates)),
      );
    }
  }

  async updateDate(
    dateUuid: string | undefined,
    fieldName: keyof NoticeOfIntentDecisionConditionDateDto,
    newValue: number | string | null,
  ) {
    if (dateUuid === undefined) {
      return;
    }

    const index = this.dates.findIndex((dto) => dto.uuid === dateUuid);

    if (index !== -1) {
      const updatedDto: NoticeOfIntentDecisionConditionDateDto = {
        uuid: dateUuid,
        [fieldName]: newValue,
      };

      const response = await this.conditionService.updateDate(dateUuid, updatedDto);
      this.dates[index] = response;
      this.dataSource = new MatTableDataSource<NoticeOfIntentDecisionConditionDateWithIndex>(
        this.addIndex(this.sortDates(this.dates)),
      );

      const conditionNewStatus = await this.decisionService.getStatus(this.condition.uuid);
      this.condition.status = conditionNewStatus.status;
      this.statusChange.emit(this.condition.status);
      this.setPillLabel(this.condition.status);
    } else {
      console.error('Date with specified UUID not found');
    }
  }

  async onDeleteDate(dateUuid: string) {
    this.confirmationDialogService
      .openDialog({ body: 'Are you sure you want to delete this date?' })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          const result = await this.conditionService.deleteDate(dateUuid);
          if (result) {
            const index = this.dates.findIndex((date) => date.uuid === dateUuid);

            if (index !== -1) {
              this.dates.splice(index, 1);
              this.dataSource = new MatTableDataSource<NoticeOfIntentDecisionConditionDateWithIndex>(
                this.addIndex(this.sortDates(this.dates)),
              );

              const conditionNewStatus = await this.decisionService.getStatus(this.condition.uuid);
              this.condition.status = conditionNewStatus.status;
              this.statusChange.emit(this.condition.status);
              this.setPillLabel(this.condition.status);
            }
          }
        }
      });
  }
}
