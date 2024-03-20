import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { APPLICATION_DECISION_COMPONENT_TYPE } from '../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import {
  PlanningReviewDecisionDto,
  PlanningReviewDecisionOutcomeCodeDto,
} from '../../../services/planning-review/planning-review-decision/planning-review-decision.dto';
import { PlanningReviewDecisionService } from '../../../services/planning-review/planning-review-decision/planning-review-decision.service';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';
import { ToastService } from '../../../services/toast/toast.service';
import {
  DRAFT_DECISION_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
} from '../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { RevertToDraftDialogComponent } from './revert-to-draft-dialog/revert-to-draft-dialog.component';

@Component({
  selector: 'app-decision-v2',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
})
export class DecisionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  isDraftExists = true;
  disabledCreateBtnTooltip =
    'A planning review can only have one decision draft at a time. Please release or delete the existing decision draft to continue.';

  fileNumber: string = '';
  decisionDate: number | undefined;
  decisions: PlanningReviewDecisionDto[] = [];
  outcomes: PlanningReviewDecisionOutcomeCodeDto[] = [];

  planningReview: PlanningReviewDto | undefined;
  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;

  constructor(
    public dialog: MatDialog,
    private planningReviewDetailService: PlanningReviewDetailService,
    private decisionService: PlanningReviewDecisionService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.pipe(takeUntil(this.$destroy)).subscribe((planningReview) => {
      if (planningReview) {
        this.fileNumber = planningReview.fileNumber;
        this.decisionDate = planningReview.decisionDate;
        this.loadDecisions(planningReview.fileNumber);
        this.planningReview = planningReview;
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    const codes = await this.decisionService.fetchCodes();
    if (codes) {
      this.outcomes = codes;
    }
    this.decisionService.loadDecisions(fileNumber);

    this.isDraftExists = this.decisions.some((d) => d.isDraft);

    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      this.decisions = decisions;
      this.isDraftExists = this.decisions.some((d) => d.isDraft);
      this.scrollToDecision();
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
      planningReviewFileNumber: this.fileNumber,
    });

    const index = this.decisions.length;
    await this.router.navigate([
      `/planning-review/${this.fileNumber}/decision/draft/${newDecision.uuid}/edit/${index + 1}`,
    ]);
  }

  async onEdit(selectedDecision: PlanningReviewDecisionDto) {
    const position = this.decisions.findIndex((decision) => decision.uuid === selectedDecision.uuid);
    const index = this.decisions.length - position;
    await this.router.navigate([
      `/planning-review/${this.fileNumber}/decision/draft/${selectedDecision.uuid}/edit/${index}`,
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
          await this.planningReviewDetailService.loadReview(this.fileNumber);

          await this.router.navigate([`/planning-review/${this.fileNumber}/decision/draft/${uuid}/edit/${index}`]);
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
          await this.planningReviewDetailService.loadReview(this.fileNumber);
          this.toastService.showSuccessToast('Decision deleted');
        }
      });
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
