import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { ApplicationDecisionComponentToConditionLotService } from '../../../../../services/application/decision/application-decision-v2/application-decision-component-to-condition-lot/application-decision-component-to-condition-lot.service';
import { ApplicationDecisionConditionService } from '../../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import {
  ApplicationDecisionConditionToComponentPlanNumberDto,
  APPLICATION_DECISION_COMPONENT_TYPE,
  ApplicationDecisionComponentDto,
  UpdateApplicationDecisionConditionDto,
  DateType,
  ApplicationDecisionConditionDateDto,
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import {
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_ONGOING_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
  DECISION_CONDITION_PENDING_LABEL,
  DECISION_CONDITION_EXPIRED_LABEL,
} from '../../../../../shared/application-type-pill/application-type-pill.constants';
import {
  ApplicationDecisionConditionWithStatus,
  ConditionComponentLabels,
  CONDITION_STATUS,
} from '../conditions.component';
import { environment } from '../../../../../../environments/environment';
import { countToString } from '../../../../../shared/utils/count-to-string';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

type Condition = ApplicationDecisionConditionWithStatus & {
  componentLabelsStr?: string;
  componentLabels?: ConditionComponentLabels[];
};

export interface ApplicationDecisionConditionDateWithIndex extends ApplicationDecisionConditionDateDto {
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

  DateType = DateType;

  dates: ApplicationDecisionConditionDateDto[] = [];

  statusLabel = DECISION_CONDITION_ONGOING_LABEL;

  singleDateLabel: string | undefined;
  showSingleDateField = false;
  showMultipleDateTable = false;
  showAdmFeeField = false;
  showSecurityAmountField = false;
  singleDateFormated: string | undefined = undefined;
  stringIndex: string = '';

  isThreeColumn = true;

  CONDITION_STATUS = CONDITION_STATUS;

  isReadMoreClicked = false;
  isReadMoreVisible = false;
  isRequireSurveyPlan = false;
  subdComponent?: ApplicationDecisionComponentDto;
  planNumbers: ApplicationDecisionConditionToComponentPlanNumberDto[] = [];

  displayColumns: string[] = ['index', 'due', 'completed', 'comment', 'action'];

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<ApplicationDecisionConditionDateWithIndex> =
    new MatTableDataSource<ApplicationDecisionConditionDateWithIndex>();

  constructor(
    private conditionService: ApplicationDecisionConditionService,
    private conditionLotService: ApplicationDecisionComponentToConditionLotService,
    private decisionService: ApplicationDecisionV2Service,
  ) {}

  async ngOnInit() {
    this.stringIndex = countToString(this.index);
    if (this.condition) {
      this.dates = Array.isArray(this.condition.dates) ? this.condition.dates : [];
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

      this.isRequireSurveyPlan = this.condition.type?.code === 'RSPL';
      this.isThreeColumn = this.showAdmFeeField && this.showSecurityAmountField;

      this.loadLots();
      this.loadPlanNumber();
      this.dataSource = new MatTableDataSource<ApplicationDecisionConditionDateWithIndex>(
        this.addIndex(this.sortDates(this.dates)),
      );
    }
  }

  async loadLots() {
    if (this.condition.components) {
      const subdComponent = this.condition.components.find(
        (component) => component.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.SUBD,
      );
      if (subdComponent && subdComponent.uuid) {
        const planNumbers = await this.conditionLotService.fetchConditionLots(this.condition.uuid, subdComponent.uuid);
        subdComponent.lots = subdComponent.lots
          ?.map((lot) => ({
            ...lot,
            uuid: lot.uuid,
            planNumbers:
              planNumbers.find((planNumber) => planNumber.componentLotUuid === lot.uuid)?.planNumbers ?? null,
          }))
          .sort((a, b) => a.index - b.index);
        this.subdComponent = subdComponent;
      }
    }
  }

  async loadPlanNumber() {
    const subdComponent = this.condition.components?.find(
      (component) => component.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.SUBD,
    );
    if (
      this.condition.components &&
      this.condition.components.some(
        (component) => component.applicationDecisionComponentTypeCode !== APPLICATION_DECISION_COMPONENT_TYPE.SUBD,
      ) &&
      this.isRequireSurveyPlan
    ) {
      const planNumbers = (await this.conditionService.fetchPlanNumbers(this.condition.uuid)).filter(
        (planNumber) => planNumber.applicationDecisionComponentUuid !== subdComponent?.uuid,
      );

      this.planNumbers =
        this.condition.components
          ?.filter(
            (component) => component.applicationDecisionComponentTypeCode !== APPLICATION_DECISION_COMPONENT_TYPE.SUBD,
          )
          .map(
            (component) =>
              ({
                applicationDecisionComponentUuid: component.uuid,
                applicationDecisionConditionUuid: this.condition.uuid,
                planNumbers: planNumbers.find(
                  (planNumber) => planNumber.applicationDecisionComponentUuid === component.uuid,
                )?.planNumbers,
              }) as ApplicationDecisionConditionToComponentPlanNumberDto,
          ) ?? [];
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => (this.isReadMoreVisible = this.checkIfReadMoreVisible()));
  }

  async onUpdateCondition(
    field: keyof UpdateApplicationDecisionConditionDto,
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

  async savePlanNumbers(lotUuid: string, conditionUuid: string, planNumbers: string | null) {
    if (this.subdComponent && this.subdComponent.uuid && this.subdComponent?.lots) {
      await this.conditionLotService.update(lotUuid, conditionUuid, planNumbers);
    }
  }

  async updateConditionPlanNumbers(conditionUuid: string, componentUuid: string, $value: string | null) {
    if (this.isRequireSurveyPlan) {
      this.conditionService.updatePlanNumbers(conditionUuid, componentUuid, $value);
    }
  }

  getComponentLabel(componentUuid: string) {
    return this.condition.conditionComponentsLabels?.find((e) => e.componentUuid === componentUuid)?.label;
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

  addIndex(data: ApplicationDecisionConditionDateDto[]): (ApplicationDecisionConditionDateDto & { index: number })[] {
    return data.map((item, i) => ({
      ...item,
      index: i + 1,
    }));
  }

  sortDates(data: ApplicationDecisionConditionDateDto[]): ApplicationDecisionConditionDateDto[] {
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
      this.dataSource = new MatTableDataSource<ApplicationDecisionConditionDateWithIndex>(
        this.addIndex(this.sortDates(this.dates)),
      );
    }
  }

  async updateDate(
    dateUuid: string | undefined,
    fieldName: keyof ApplicationDecisionConditionDateDto,
    newValue: number | string | null,
  ) {
    if (dateUuid === undefined) {
      return;
    }

    const index = this.dates.findIndex((dto) => dto.uuid === dateUuid);

    if (index !== -1) {
      const updatedDto: ApplicationDecisionConditionDateDto = {
        uuid: dateUuid,
        [fieldName]: newValue,
      };

      const response = await this.conditionService.updateDate(dateUuid, updatedDto);
      this.dates[index] = response;
      this.dataSource = new MatTableDataSource<ApplicationDecisionConditionDateWithIndex>(
        this.addIndex(this.sortDates(this.dates)),
      );
    } else {
      await this.addNewDate();
    }
    const conditionNewStatus = await this.decisionService.getStatus(this.condition.uuid);
    this.condition.status = conditionNewStatus.status;
    this.setPillLabel(this.condition.status);
  }

  async onDeleteDate(dateUuid: string) {
    const result = await this.conditionService.deleteDate(dateUuid);
    if (result) {
      const index = this.dates.findIndex((date) => date.uuid === dateUuid);

      if (index !== -1) {
        this.dates.splice(index, 1);
        this.dataSource = new MatTableDataSource<ApplicationDecisionConditionDateWithIndex>(
          this.addIndex(this.sortDates(this.dates)),
        );
        const conditionNewStatus = await this.decisionService.getStatus(this.condition.uuid);
        this.condition.status = conditionNewStatus.status;
        this.setPillLabel(this.condition.status);
      }
    }
  }
}
