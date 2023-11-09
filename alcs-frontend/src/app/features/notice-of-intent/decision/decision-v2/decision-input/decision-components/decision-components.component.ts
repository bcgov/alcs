import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  NOI_DECISION_COMPONENT_TYPE,
  NoticeOfIntentDecisionCodesDto,
  NoticeOfIntentDecisionComponentDto,
  NoticeOfIntentDecisionComponentTypeDto,
} from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentSubmissionService } from '../../../../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import {
  NoticeOfIntentDto,
  NoticeOfIntentSubmissionDto,
} from '../../../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionComponentComponent } from './decision-component/decision-component.component';

export type DecisionComponentTypeMenuItem = NoticeOfIntentDecisionComponentTypeDto & {
  isDisabled: boolean;
  uiCode: string;
};

@Component({
  selector: 'app-decision-components',
  templateUrl: './decision-components.component.html',
  styleUrls: ['./decision-components.component.scss'],
})
export class DecisionComponentsComponent implements OnInit, OnDestroy, AfterViewInit {
  $destroy = new Subject<void>();

  @Input() codes!: NoticeOfIntentDecisionCodesDto;
  @Input() fileNumber!: string;
  @Input() showError = false;

  @Input() components: NoticeOfIntentDecisionComponentDto[] = [];
  @Output() componentsChange = new EventEmitter<{
    components: NoticeOfIntentDecisionComponentDto[];
    isValid: boolean;
  }>();
  @ViewChildren(DecisionComponentComponent) childComponents!: QueryList<DecisionComponentComponent>;

  noticeOfIntent!: NoticeOfIntentDto;
  noticeOfIntentSubmission!: NoticeOfIntentSubmissionDto;
  decisionComponentTypes: DecisionComponentTypeMenuItem[] = [];

  constructor(
    private toastService: ToastService,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private submissionService: NoticeOfIntentSubmissionService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent
      .pipe(takeUntil(this.$destroy))
      .subscribe(async (noticeOfIntent) => {
        if (noticeOfIntent) {
          this.noticeOfIntent = noticeOfIntent;
          this.noticeOfIntentSubmission = await this.submissionService.fetchSubmission(noticeOfIntent.fileNumber);
          await this.prepareDecisionComponentTypes(this.codes);
        }
      });

    // validate components on load
    setTimeout(() => this.onChange(), 0);
  }

  ngAfterViewInit(): void {
    // subscribes to child components and triggers validation on add/delete. NOTE: this is NOT getting called on first page load
    this.childComponents.changes.subscribe(() => {
      // setTimeout is required to ensure that current code is executed after the current change detection cycle completes, avoiding the ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => this.onChange(), 0);
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onAddNewComponent(uiCode: string, typeCode: string) {
    switch (uiCode) {
      case 'COPY':
        const component: NoticeOfIntentDecisionComponentDto = {
          noticeOfIntentDecisionComponentTypeCode: typeCode,
          alrArea: this.noticeOfIntent.alrArea,
          agCap: this.noticeOfIntent.agCap,
          agCapSource: this.noticeOfIntent.agCapSource,
          agCapMap: this.noticeOfIntent.agCapMap,
          agCapConsultant: this.noticeOfIntent.agCapConsultant,
          noticeOfIntentDecisionComponentType: this.decisionComponentTypes.find(
            (e) => e.code === typeCode && e.uiCode !== 'COPY'
          )!,
        };

        if (typeCode === NOI_DECISION_COMPONENT_TYPE.POFO) {
          this.patchPofoFields(component);
        }

        if (typeCode === NOI_DECISION_COMPONENT_TYPE.ROSO) {
          this.patchRosoFields(component);
        }

        if (typeCode === NOI_DECISION_COMPONENT_TYPE.PFRS) {
          this.patchPfrsFields(component);
        }

        this.components.unshift(component);
        break;
      case NOI_DECISION_COMPONENT_TYPE.POFO:
      case NOI_DECISION_COMPONENT_TYPE.ROSO:
      case NOI_DECISION_COMPONENT_TYPE.PFRS:
        const componentType = this.decisionComponentTypes.find((e) => e.code === typeCode && e.uiCode !== 'COPY');
        this.components.unshift({
          noticeOfIntentDecisionComponentTypeCode: typeCode,
          noticeOfIntentDecisionComponentType: componentType,
        } as unknown as NoticeOfIntentDecisionComponentDto);
        break;
      default:
        this.toastService.showErrorToast(`Failed to create component ${typeCode}`);
    }

    this.updateComponentsMenuItems();
  }

  onRemove(index: number) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to remove this component?',
      })
      .subscribe((didConfirm) => {
        if (didConfirm) {
          this.components.splice(index, 1);
          this.updateComponentsMenuItems();
        }
      });
  }

  trackByFn(index: any, item: NoticeOfIntentDecisionComponentDto) {
    return item.noticeOfIntentDecisionComponentTypeCode;
  }

  onChange() {
    const isValid =
      this.components.length > 0 && (!this.childComponents || this.childComponents?.length < 1)
        ? false
        : this.childComponents.reduce((isValid, component) => isValid && component.form.valid, true);

    this.componentsChange.emit({
      components: this.components,
      isValid,
    });
  }

  private async prepareDecisionComponentTypes(codes: NoticeOfIntentDecisionCodesDto) {
    const decisionComponentTypes: DecisionComponentTypeMenuItem[] = codes.decisionComponentTypes.map((e) => ({
      ...e,
      isDisabled: false,
      uiCode: e.code,
    }));

    const mappedProposalType = decisionComponentTypes.find((e) => e.code === this.noticeOfIntent.type.code);

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

  private patchPfrsFields(component: NoticeOfIntentDecisionComponentDto) {
    this.patchRosoFields(component);
    this.patchRosoFields(component);
    component.endDate2 = this.noticeOfIntent.proposalEndDate2;
  }

  private patchPofoFields(component: NoticeOfIntentDecisionComponentDto) {
    component.endDate = this.noticeOfIntent.proposalEndDate;
    component.soilFillTypeToPlace = this.noticeOfIntentSubmission.soilFillTypeToPlace;
    component.soilToPlaceVolume = this.noticeOfIntentSubmission.soilToPlaceVolume;
    component.soilToPlaceArea = this.noticeOfIntentSubmission.soilToPlaceArea;
    component.soilToPlaceMaximumDepth = this.noticeOfIntentSubmission.soilToPlaceMaximumDepth;
    component.soilToPlaceAverageDepth = this.noticeOfIntentSubmission.soilToPlaceAverageDepth;
  }

  private patchRosoFields(component: NoticeOfIntentDecisionComponentDto) {
    component.endDate = this.noticeOfIntent.proposalEndDate;
    component.soilTypeRemoved = this.noticeOfIntentSubmission.soilTypeRemoved;
    component.soilToRemoveVolume = this.noticeOfIntentSubmission.soilToRemoveVolume;
    component.soilToRemoveArea = this.noticeOfIntentSubmission.soilToRemoveArea;
    component.soilToRemoveMaximumDepth = this.noticeOfIntentSubmission.soilToRemoveMaximumDepth;
    component.soilToRemoveAverageDepth = this.noticeOfIntentSubmission.soilToRemoveAverageDepth;
  }

  private updateComponentsMenuItems() {
    this.decisionComponentTypes = this.decisionComponentTypes.map((e) => ({
      ...e,
      isDisabled: this.components.some((c) => c.noticeOfIntentDecisionComponentTypeCode === e.code),
    }));
  }

  onValidate() {
    this.childComponents.forEach((component) => component.form.markAllAsTouched());
  }
}
