import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../../services/application/application.dto';
import {
  DecisionCodesDto,
  DecisionComponentDto,
  DecisionComponentTypeDto,
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../../services/toast/toast.service';

export type DecisionComponentTypeMenuItem = DecisionComponentTypeDto & { isDisabled: boolean; uiCode: string };

@Component({
  selector: 'app-decision-components',
  templateUrl: './decision-components.component.html',
  styleUrls: ['./decision-components.component.scss'],
})
export class DecisionComponentsComponent implements OnInit, OnDestroy {
  @Input()
  codes!: DecisionCodesDto;
  @Input()
  fileNumber!: string;

  @Input()
  components: DecisionComponentDto[] = [];
  @Output() componentsChange = new EventEmitter<DecisionComponentDto[]>();

  decisionComponentTypes: DecisionComponentTypeMenuItem[] = [];

  $destroy = new Subject<void>();

  application!: ApplicationDto;

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private toastService: ToastService,
    private applicationDetailService: ApplicationDetailService
  ) {}

  ngOnInit(): void {
    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      if (decision && decision.components) {
        this.components = decision.components;
      }
    });

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
    console.log(uiCode, typeCode);
    switch (uiCode) {
      case 'COPY':
        const component: DecisionComponentDto = {
          applicationDecisionComponentTypeCode: typeCode,
          alrArea: this.application.alrArea,
          agCap: this.application.agCap,
          agCapSource: this.application.agCapSource,
          agCapMap: this.application.agCapMap,
          agCapConsultant: this.application.agCapConsultant,
          nfuType: this.application.nfuUseType,
          nfuSubType: this.application.nfuUseSubType,
          nfuEndDate: this.application.nfuEndDate,
        };
        console.log('onAddNewComponent', component);

        this.components.push(component);
        break;
      case 'NFUP':
        this.components.push({
          applicationDecisionComponentTypeCode: typeCode,
        } as DecisionComponentDto);
        break;
      default:
        this.toastService.showErrorToast(`Failed to create component ${typeCode}`);
    }

    this.updateComponentsMenuItems();
  }

  private updateComponentsMenuItems() {
    console.log('updateComponentsMenuItems', this.components, this.decisionComponentTypes);
    this.decisionComponentTypes = this.decisionComponentTypes.map((e) => ({
      ...e,
      isDisabled: this.components.some((c) => c.applicationDecisionComponentTypeCode === e.code),
    }));
  }

  onRemove(index: number) {
    this.components.splice(index);
    this.updateComponentsMenuItems();
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}
