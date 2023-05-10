import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationSubmissionService } from '../../../../../services/application/application-submission/application-submission.service';
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

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private toastService: ToastService,
    private applicationSubmissionService: ApplicationSubmissionService
  ) {}

  ngOnInit(): void {
    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      if (decision && decision.components) {
        this.components = decision.components;
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

    const submission = await this.applicationSubmissionService.fetchSubmission(this.fileNumber);
    const mappedProposalType = decisionComponentTypes.find((e) => e.code === submission.typeCode);

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

  onAddNewCondition(typeCode: string) {
    switch (typeCode) {
      case 'COPY':
        // TODO get the proposal data and populate fields
        // add component
        this.components.push({ applicationDecisionComponentTypeCode: typeCode } as DecisionComponentDto);
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
