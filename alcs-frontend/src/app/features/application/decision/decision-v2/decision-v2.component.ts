import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationDecisionComponentService } from '../../../../services/application/decision/application-decision-v2/application-decision-component/application-decision-component.service';
import {
  ApplicationDecisionWithLinkedResolutionDto,
  APPLICATION_DECISION_COMPONENT_TYPE,
  CeoCriterionDto,
  DecisionMakerDto,
  DecisionOutcomeCodeDto,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../services/toast/toast.service';
import {
  DRAFT_DECISION_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';
import { decisionChildRoutes } from '../decision.module';
import { RevertToDraftDialogComponent } from './revert-to-draft-dialog/revert-to-draft-dialog.component';

type LoadingDecision = ApplicationDecisionWithLinkedResolutionDto & {
  loading: boolean;
};

@Component({
  selector: 'app-decision-v2',
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
  outcomes: DecisionOutcomeCodeDto[] = [];
  decisionMakers: DecisionMakerDto[] = [];
  ceoCriterion: CeoCriterionDto[] = [];
  isPaused = true;

  reconLabel = RECON_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;
  application: ApplicationDto | undefined;
  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;

  COMPONENT_TYPE = APPLICATION_DECISION_COMPONENT_TYPE;

  constructor(
    public dialog: MatDialog,
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionV2Service,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationDecisionComponentService: ApplicationDecisionComponentService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.decisionDate = application.decisionDate;
        this.isPaused = application.paused;
        this.loadDecisions(application.fileNumber);
        this.application = application;
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    const codes = await this.decisionService.fetchCodes();
    this.outcomes = codes.outcomes;
    this.decisionMakers = codes.decisionMakers;
    this.ceoCriterion = codes.ceoCriterion;
    this.decisionService.loadDecisions(fileNumber);

    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      this.decisions = decisions.map((decision) => ({
        ...decision,
        loading: false,
      }));

      this.scrollToDecision();

      this.isDraftExists = this.decisions.some((d) => d.isDraft);
      this.disabledCreateBtnTooltip = this.isPaused
        ? 'This application is currently paused. Only active applications can have decisions.'
        : 'An application can only have one decision draft at a time. Please release or delete the existing decision draft to continue.';
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
      chairReviewRequired: true,
      isDraft: true,
      date: Date.now(),
      applicationFileNumber: this.fileNumber,
      modifiesUuid: null,
      reconsidersUuid: null,
    });

    const index = this.decisions.length;
    await this.router.navigate([
      `/application/${this.fileNumber}/decision/draft/${newDecision.uuid}/edit/${index + 1}`,
    ]);
  }

  async onEdit(selectedDecision: ApplicationDecisionWithLinkedResolutionDto) {
    const position = this.decisions.findIndex((decision) => decision.uuid === selectedDecision.uuid);
    const index = this.decisions.length - position;
    await this.router.navigate([
      `/application/${this.fileNumber}/decision/draft/${selectedDecision.uuid}/edit/${index}`,
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
          await this.applicationDetailService.loadApplication(this.fileNumber);

          await this.router.navigate([`/application/${this.fileNumber}/decision/draft/${uuid}/edit/${index}`]);
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
          await this.applicationDetailService.loadApplication(this.fileNumber);
          this.toastService.showSuccessToast('Decision deleted');
        }
      });
  }

  async attachFile(decisionUuid: string, event: Event) {
    this.decisions = this.decisions.map((decision) => {
      return {
        ...decision,
        loading: decision.uuid === decisionUuid,
      };
    });
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      const uploadedFile = await this.decisionService.uploadFile(decisionUuid, file);
      if (uploadedFile) {
        await this.loadDecisions(this.fileNumber);
      }
    }
  }

  async onSaveChairReviewDate(decisionUuid: string, chairReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      chairReviewDate: formatDateForApi(chairReviewDate),
      chairReviewRequired: true,
      isDraft: this.decisions.find((e) => e.uuid === decisionUuid)?.isDraft,
    });
    await this.loadDecisions(this.fileNumber);
  }

  async onSaveAuditDate(decisionUuid: string, auditReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      auditDate: formatDateForApi(auditReviewDate),
      isDraft: this.decisions.find((e) => e.uuid === decisionUuid)?.isDraft,
    });
    await this.loadDecisions(this.fileNumber);
  }

  async onSaveAlrArea(decisionUuid: string, componentUuid: string | undefined, value?: any) {
    const decision = this.decisions.find((e) => e.uuid === decisionUuid);
    const component = decision?.components.find((e) => e.uuid === componentUuid);
    if (componentUuid && component) {
      await this.applicationDecisionComponentService.update(componentUuid, {
        uuid: componentUuid,
        applicationDecisionComponentTypeCode: component.applicationDecisionComponentTypeCode,
        alrArea: value ? value : null,
      });
    } else {
      this.toastService.showErrorToast('Unable to update the Alr Area. Please reload the page and try again.');
    }

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
