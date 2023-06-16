import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChildren } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../../../services/application/application-submission/application-submission.service';
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

  constructor(
    private toastService: ToastService,
    private applicationDetailService: ApplicationDetailService,
    private submissionService: ApplicationSubmissionService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe(async (application) => {
      if (application) {
        this.application = application;
        this.application.submittedApplication = await this.submissionService.fetchSubmission(application.fileNumber);
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

        if (typeCode === APPLICATION_DECISION_COMPONENT_TYPE.POFO) {
          this.patchPofoFields(component);
        }

        if (typeCode === APPLICATION_DECISION_COMPONENT_TYPE.ROSO) {
          this.patchRosoFields(component);
        }

        if (typeCode === APPLICATION_DECISION_COMPONENT_TYPE.PFRS) {
          this.patchPfrsFields(component);
        }

        this.components.push(component);
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.NFUP:
      case APPLICATION_DECISION_COMPONENT_TYPE.TURP:
      case APPLICATION_DECISION_COMPONENT_TYPE.POFO:
      case APPLICATION_DECISION_COMPONENT_TYPE.ROSO:
      case APPLICATION_DECISION_COMPONENT_TYPE.PFRS:
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

  private patchPofoFields(component: DecisionComponentDto) {
    component.endDate = this.application.proposalEndDate;
    component.soilFillTypeToPlace = this.application.submittedApplication?.soilFillTypeToPlace;
    component.soilToPlaceVolume = this.application.submittedApplication?.soilToPlaceVolume;
    component.soilToPlaceArea = this.application.submittedApplication?.soilToPlaceArea;
    component.soilToPlaceMaximumDepth = this.application.submittedApplication?.soilToPlaceMaximumDepth;
    component.soilToPlaceAverageDepth = this.application.submittedApplication?.soilToPlaceAverageDepth;
  }

  private patchRosoFields(component: DecisionComponentDto) {
    component.endDate = this.application.proposalEndDate;
    component.soilTypeRemoved = this.application.submittedApplication?.soilTypeRemoved;
    component.soilToRemoveVolume = this.application.submittedApplication?.soilToRemoveVolume;
    component.soilToRemoveArea = this.application.submittedApplication?.soilToRemoveArea;
    component.soilToRemoveMaximumDepth = this.application.submittedApplication?.soilToRemoveMaximumDepth;
    component.soilToRemoveAverageDepth = this.application.submittedApplication?.soilToRemoveAverageDepth;
  }

  private patchPfrsFields(component: DecisionComponentDto) {
    this.patchPofoFields(component);
    this.patchRosoFields(component);
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
