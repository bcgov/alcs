import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDecisionComponentService } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-component/notice-of-intent-decision-component.service';
import { NoticeOfIntentDecisionV2Service } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  NOI_DECISION_COMPONENT_TYPE,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
} from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import {
  DRAFT_DECISION_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';
import { decisionChildRoutes } from '../decision.module';
import { RevertToDraftDialogComponent } from './revert-to-draft-dialog/revert-to-draft-dialog.component';

type LoadingDecision = NoticeOfIntentDecisionDto & {
  loading: boolean;
};

export const OUTCOMES_WITH_COMPONENTS = ['APPR', 'APPA', 'RESC'];

@Component({
  selector: 'app-noi-decision-v2',
  templateUrl: './decision-v2.component.html',
  styleUrls: ['./decision-v2.component.scss'],
})
export class DecisionV2Component implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  createDecision = decisionChildRoutes.find((e) => e.path === 'create')!;
  isDraftExists = true;
  disabledCreateBtnTooltip = '';

  fileNumber: string = '';
  decisionDate: number | undefined;
  decisions: LoadingDecision[] = [];
  outcomes: NoticeOfIntentDecisionOutcomeCodeDto[] = [];
  isPaused = true;
  OUTCOMES_WITH_COMPONENTS = OUTCOMES_WITH_COMPONENTS;

  modificationLabel = MODIFICATION_TYPE_LABEL;
  noticeOfIntent: NoticeOfIntentDto | undefined;
  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;

  COMPONENT_TYPE = NOI_DECISION_COMPONENT_TYPE;

  constructor(
    public dialog: MatDialog,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
    private noticeOfIntentDecisionComponentService: NoticeOfIntentDecisionComponentService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.$destroy)).subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.fileNumber = noticeOfIntent.fileNumber;
        this.decisionDate = noticeOfIntent.decisionDate;
        this.isPaused = noticeOfIntent.paused;
        this.loadDecisions(noticeOfIntent.fileNumber);
        this.noticeOfIntent = noticeOfIntent;
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    const codes = await this.decisionService.fetchCodes();
    this.outcomes = codes.outcomes;
    this.decisionService.loadDecisions(fileNumber);

    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      this.decisions = decisions.map((decision) => ({
        ...decision,
        loading: false,
      }));

      this.scrollToDecision();

      this.isDraftExists = this.decisions.some((d) => d.isDraft);
      this.disabledCreateBtnTooltip = this.isPaused
        ? 'This notice of intent is currently paused. Only active notice of intents can have decisions.'
        : 'A notice of intent can only have one decision draft at a time. Please release or delete the existing decision draft to continue.';
    });
  }

  scrollToDecision() {
    const decisionUuid = this.activatedRouter.snapshot.queryParamMap.get('uuid');

    setTimeout(() => {
      if (this.decisions.length > 0 && decisionUuid) {
        this.scrollToElement(decisionUuid);
      }
    });
  }

  async onCreate() {
    const newDecision = await this.decisionService.create({
      resolutionYear: new Date().getFullYear(),
      isDraft: true,
      date: Date.now(),
      fileNumber: this.fileNumber,
    });

    const index = this.decisions.length;
    await this.router.navigate([
      `/notice-of-intent/${this.fileNumber}/decision/draft/${newDecision.uuid}/edit/${index + 1}`,
    ]);
  }

  async onEdit(selectedDecision: NoticeOfIntentDecisionDto) {
    const position = this.decisions.findIndex((decision) => decision.uuid === selectedDecision.uuid);
    const index = this.decisions.length - position;
    await this.router.navigate([
      `/notice-of-intent/${this.fileNumber}/decision/draft/${selectedDecision.uuid}/edit/${index}`,
    ]);
  }

  async onRevertToDraft(uuid: string) {
    const position = this.decisions.findIndex((decision) => decision.uuid === uuid);
    const index = this.decisions.length - position;
    this.dialog
      .open(RevertToDraftDialogComponent, {
        data: { fileNumber: this.fileNumber },
      })
      .beforeClosed()
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          await this.decisionService.update(uuid, {
            isDraft: true,
          });
          await this.noticeOfIntentDetailService.load(this.fileNumber);

          await this.router.navigate([`/notice-of-intent/${this.fileNumber}/decision/draft/${uuid}/edit/${index}`]);
        }
      });
  }

  async deleteDecision(uuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected decision?',
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          this.decisions = this.decisions.map((decision) => {
            return {
              ...decision,
              loading: decision.uuid === uuid,
            };
          });
          await this.decisionService.delete(uuid);
          await this.noticeOfIntentDetailService.load(this.fileNumber);
          this.toastService.showSuccessToast('Decision deleted');
        }
      });
  }

  async onSaveAuditDate(decisionUuid: string, auditReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      auditDate: formatDateForApi(auditReviewDate),
      isDraft: this.decisions.find((e) => e.uuid === decisionUuid)!.isDraft,
    });
    await this.loadDecisions(this.fileNumber);
  }

  async onSaveAlrArea(decisionUuid: string, componentUuid: string | undefined, value?: any) {
    const decision = this.decisions.find((e) => e.uuid === decisionUuid);
    const component = decision?.components.find((e) => e.uuid === componentUuid);
    if (componentUuid && component) {
      await this.noticeOfIntentDecisionComponentService.update(componentUuid, {
        uuid: componentUuid,
        noticeOfIntentDecisionComponentTypeCode: component.noticeOfIntentDecisionComponentTypeCode,
        alrArea: value ? value : null,
      });
    } else {
      this.toastService.showErrorToast('Unable to update the Alr Area. Please reload the page and try again.');
    }

    await this.loadDecisions(this.fileNumber);
  }

  async onStatsRequiredUpdate(decisionUuid: string, value: boolean) {
    await this.decisionService.update(decisionUuid, {
      isStatsRequired: value,
      isDraft: this.decisions.find((e) => e.uuid === decisionUuid)!.isDraft,
    });
    await this.loadDecisions(this.fileNumber);
  }

  ngOnDestroy(): void {
    this.decisionService.clearDecisions();
    this.$destroy.next();
    this.$destroy.complete();
  }

  scrollToElement(elementId: string) {
    const id = `#${CSS.escape(elementId)}`;
    const element = this.elementRef.nativeElement.querySelector(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start',
      });
    }
  }
}
