import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChildren } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../../../services/application/application.dto';
import {
  APPLICATION_DECISION_COMPONENT_TYPE,
  DecisionCodesDto,
  DecisionComponentDto,
  DecisionComponentTypeDto,
} from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { DecisionComponentComponent } from './decision-component/decision-component.component';

export type DecisionComponentTypeMenuItem = DecisionComponentTypeDto & { isDisabled: boolean; uiCode: string };

@Component({
  selector: 'app-decision-components',
  templateUrl: './decision-components.component.html',
  styleUrls: ['./decision-components.component.scss'],
})
export class DecisionComponentsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() codes!: DecisionCodesDto;
  @Input() fileNumber!: string;

  @Input() components: DecisionComponentDto[] = [];
  @Output() componentsChange = new EventEmitter<{
    components: DecisionComponentDto[];
    isValid: boolean;
  }>();
  @ViewChildren(DecisionComponentComponent) childComponents: DecisionComponentComponent[] = [];

  application!: ApplicationDto;
  decisionComponentTypes: DecisionComponentTypeMenuItem[] = [];

  constructor(private toastService: ToastService, private applicationDetailService: ApplicationDetailService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
      }
    });

    this.prepareDecisionComponentTypes(this.codes);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async prepareDecisionComponentTypes(codes: DecisionCodesDto) {
    const decisionComponentTypes: DecisionComponentTypeMenuItem[] = codes.decisionComponentTypes.map((e) => ({
      ...e,
      isDisabled: false,
      uiCode: e.code,
    }));

    const mappedProposalType = decisionComponentTypes.find((e) => e.code === this.application.type.code);

    if (mappedProposalType) {
      const proposalDecisionType: DecisionComponentTypeMenuItem = {
        isDisabled: false,
        uiCode: 'COPY',
        code: mappedProposalType!.code,
        label: `Copy Proposal - ${mappedProposalType?.label}`,
        description: mappedProposalType?.description ?? '',
      };
      decisionComponentTypes.unshift(proposalDecisionType);
    }
    this.decisionComponentTypes = decisionComponentTypes;

    this.updateComponentsMenuItems();
  }

  onAddNewComponent(uiCode: string, typeCode: string) {
    switch (uiCode) {
      case 'COPY':
        const component: DecisionComponentDto = {
          applicationDecisionComponentTypeCode: typeCode,
          alrArea: this.application.alrArea,
          agCap: this.application.agCap,
          agCapSource: this.application.agCapSource,
          agCapMap: this.application.agCapMap,
          agCapConsultant: this.application.agCapConsultant,
        };

        if (typeCode === APPLICATION_DECISION_COMPONENT_TYPE.NFUP) {
          this.patchNfuFields(component);
        }

        if (typeCode === APPLICATION_DECISION_COMPONENT_TYPE.TURP) {
          this.patchTurpFields(component);
        }

        this.components.push(component);
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.NFUP:
      case APPLICATION_DECISION_COMPONENT_TYPE.TURP:
        this.components.push({
          applicationDecisionComponentTypeCode: typeCode,
        } as DecisionComponentDto);
        break;
      default:
        this.toastService.showErrorToast(`Failed to create component ${typeCode}`);
    }

    this.updateComponentsMenuItems();
    this.onChange();
  }

  private patchNfuFields(component: DecisionComponentDto) {
    component.nfuType = this.application.nfuUseType;
    component.nfuSubType = this.application.nfuUseSubType;
    component.endDate = this.application.proposalEndDate;
  }

  private patchTurpFields(component: DecisionComponentDto) {
    component.endDate = this.application.proposalEndDate;
  }

  private updateComponentsMenuItems() {
    this.decisionComponentTypes = this.decisionComponentTypes.map((e) => ({
      ...e,
      isDisabled: this.components.some((c) => c.applicationDecisionComponentTypeCode === e.code),
    }));
  }

  onRemove(index: number) {
    this.components.splice(index);
    this.updateComponentsMenuItems();
    this.onChange();
  }

  trackByFn(index: any, item: DecisionComponentDto) {
    return item.applicationDecisionComponentTypeCode;
  }

  onChange() {
    this.componentsChange.emit({
      components: this.components,
      isValid: this.childComponents.reduce((isValid, component) => isValid && component.form.valid, true),
    });
  }
}
