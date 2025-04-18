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
import { ApplicationDetailService } from '../../../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../../../services/application/application-submission/application-submission.service';
import { ApplicationDto } from '../../../../../../services/application/application.dto';
import {
  APPLICATION_DECISION_COMPONENT_TYPE,
  ApplicationDecisionCodesDto,
  ApplicationDecisionComponentDto,
  DecisionComponentTypeDto,
} from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionComponentComponent } from './decision-component/decision-component.component';

export type DecisionComponentTypeMenuItem = DecisionComponentTypeDto & { isDisabled: boolean; uiCode: string };

@Component({
  selector: 'app-decision-components',
  templateUrl: './decision-components.component.html',
  styleUrls: ['./decision-components.component.scss'],
})
export class DecisionComponentsComponent implements OnInit, OnDestroy, AfterViewInit {
  $destroy = new Subject<void>();

  @Input() codes!: ApplicationDecisionCodesDto;
  @Input() fileNumber!: string;
  @Input() showError = false;

  @Input() components: ApplicationDecisionComponentDto[] = [];
  @Output() componentsChange = new EventEmitter<{
    components: ApplicationDecisionComponentDto[];
    isValid: boolean;
  }>();
  @ViewChildren(DecisionComponentComponent) childComponents!: QueryList<DecisionComponentComponent>;

  application!: ApplicationDto;
  decisionComponentTypes: DecisionComponentTypeMenuItem[] = [];

  constructor(
    private toastService: ToastService,
    private applicationDetailService: ApplicationDetailService,
    private submissionService: ApplicationSubmissionService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe(async (application) => {
      if (application) {
        this.application = application;
        this.application.submittedApplication = await this.submissionService.fetchSubmission(application.fileNumber);
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
        const component: ApplicationDecisionComponentDto = {
          applicationDecisionComponentTypeCode: typeCode,
          alrArea: this.application.alrArea,
          agCap: this.application.agCap,
          agCapSource: this.application.agCapSource,
          agCapMap: this.application.agCapMap,
          agCapConsultant: this.application.agCapConsultant,
          applicationDecisionComponentType: this.decisionComponentTypes.find(
            (e) => e.code === typeCode && e.uiCode !== 'COPY',
          ),
          lots: this.application.submittedApplication?.subdProposedLots.map((lot, index) => ({
            ...lot,
            index: index,
            uuid: '',
          })),
        };

        if (typeCode === APPLICATION_DECISION_COMPONENT_TYPE.NFUP) {
          this.patchNfuFields(component);
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

        if (
          typeCode === APPLICATION_DECISION_COMPONENT_TYPE.INCL ||
          typeCode === APPLICATION_DECISION_COMPONENT_TYPE.EXCL
        ) {
          this.patchInclExclFields(component);
        }

        this.components.unshift(component);
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.NFUP:
      case APPLICATION_DECISION_COMPONENT_TYPE.TURP:
      case APPLICATION_DECISION_COMPONENT_TYPE.POFO:
      case APPLICATION_DECISION_COMPONENT_TYPE.ROSO:
      case APPLICATION_DECISION_COMPONENT_TYPE.PFRS:
      case APPLICATION_DECISION_COMPONENT_TYPE.NARU:
      case APPLICATION_DECISION_COMPONENT_TYPE.SUBD:
      case APPLICATION_DECISION_COMPONENT_TYPE.INCL:
      case APPLICATION_DECISION_COMPONENT_TYPE.EXCL:
      case APPLICATION_DECISION_COMPONENT_TYPE.COVE:
        this.components.unshift({
          applicationDecisionComponentTypeCode: typeCode,
          applicationDecisionComponentType: this.decisionComponentTypes.find(
            (e) => e.code === typeCode && e.uiCode !== 'COPY',
          ),
        } as ApplicationDecisionComponentDto);
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

  trackByFn(index: any, item: ApplicationDecisionComponentDto) {
    return item.applicationDecisionComponentTypeCode;
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

  onValidate() {
    this.childComponents.forEach((component) => {
      component.form.markAllAsTouched();
      if ('markTouched' in component) {
        component.markTouched();
      }
    });
  }

  private async prepareDecisionComponentTypes(codes: ApplicationDecisionCodesDto) {
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

  private patchNfuFields(component: ApplicationDecisionComponentDto) {
    component.nfuType = this.application.nfuUseType;
    component.nfuSubType = this.application.nfuUseSubType;
  }

  private patchPfrsFields(component: ApplicationDecisionComponentDto) {
    this.patchPofoFields(component);
    this.patchRosoFields(component);
  }

  private patchPofoFields(component: ApplicationDecisionComponentDto) {
    component.soilFillTypeToPlace = this.application.submittedApplication?.soilFillTypeToPlace;
    component.soilToPlaceVolume = this.application.submittedApplication?.soilToPlaceVolume;
    component.soilToPlaceArea = this.application.submittedApplication?.soilToPlaceArea;
    component.soilToPlaceMaximumDepth = this.application.submittedApplication?.soilToPlaceMaximumDepth;
    component.soilToPlaceAverageDepth = this.application.submittedApplication?.soilToPlaceAverageDepth;
  }

  private patchRosoFields(component: ApplicationDecisionComponentDto) {
    component.soilTypeRemoved = this.application.submittedApplication?.soilTypeRemoved;
    component.soilToRemoveVolume = this.application.submittedApplication?.soilToRemoveVolume;
    component.soilToRemoveArea = this.application.submittedApplication?.soilToRemoveArea;
    component.soilToRemoveMaximumDepth = this.application.submittedApplication?.soilToRemoveMaximumDepth;
    component.soilToRemoveAverageDepth = this.application.submittedApplication?.soilToRemoveAverageDepth;
  }

  private patchInclExclFields(component: ApplicationDecisionComponentDto) {
    if (this.application.inclExclApplicantType) {
      component.inclExclApplicantType = this.application.inclExclApplicantType;
    } else {
      component.inclExclApplicantType =
        this.application.submittedApplication?.inclGovernmentOwnsAllParcels === false
          ? 'L/FNG Initiated'
          : 'Land Owner';
    }
  }

  private updateComponentsMenuItems() {
    this.decisionComponentTypes = this.decisionComponentTypes.map((e) => ({
      ...e,
      isDisabled: this.components.some((c) => c.applicationDecisionComponentTypeCode === e.code),
    }));
  }
}
