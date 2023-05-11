import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import {
  ApplicationDecisionDto,
  CeoCriterionDto,
  DecisionMakerDto,
  DecisionOutcomeCodeDto,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../services/toast/toast.service';
import {
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';
import { decisionChildRoutes } from '../decision.module';

type LoadingDecision = ApplicationDecisionDto & {
  reconsideredByResolutions: string[];
  modifiedByResolutions: string[];
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

  constructor(
    public dialog: MatDialog,
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionV2Service,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router
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
        reconsideredByResolutions: decision.reconsideredBy?.flatMap((r) => r.linkedResolutions) || [],
        modifiedByResolutions: decision.modifiedBy?.flatMap((r) => r.linkedResolutions) || [],
        loading: false,
      }));

      this.isDraftExists = this.decisions.some((d) => d.isDraft);
      this.disabledCreateBtnTooltip = this.isPaused
        ? 'This application is currently paused. Only active applications can have decisions.'
        : 'You cannot create a decision if there are unpublished decisions.';
    });
  }

  async onCreate() {
    let minDate = new Date(0);
    if (this.decisions.length > 0) {
      minDate = new Date(this.decisions[this.decisions.length - 1].date);
    }

    const newDecision = await this.decisionService.create({
      resolutionYear: new Date().getFullYear(),
      chairReviewRequired: false,
      isDraft: true,
      date: Date.now(),
      applicationFileNumber: this.fileNumber,
      modifiesUuid: null,
      reconsidersUuid: null,
    });

    await this.router.navigate([`/application/${this.fileNumber}/decision/draft/${newDecision.uuid}/edit`]);
  }

  async onEdit(decision: LoadingDecision) {
    const decisionIndex = this.decisions.indexOf(decision);
    // TODO set minDate for the decision in input
    let minDate = new Date(0);
    if (decisionIndex !== this.decisions.length - 1) {
      minDate = new Date(this.decisions[this.decisions.length - 1].date);
    }

    await this.router.navigate([`/application/${this.fileNumber}/decision/draft/${decision.uuid}/edit`]);
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

  async downloadFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    await this.decisionService.downloadFile(decisionUuid, decisionDocumentUuid, fileName, false);
  }

  async openFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    await this.decisionService.downloadFile(decisionUuid, decisionDocumentUuid, fileName);
  }

  async deleteFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete the file ${fileName}?`,
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          this.decisions = this.decisions.map((decision) => {
            return {
              ...decision,
              loading: decision.uuid === decisionUuid,
            };
          });

          await this.decisionService.deleteFile(decisionUuid, decisionDocumentUuid);
          await this.loadDecisions(this.fileNumber);
          this.toastService.showSuccessToast('File deleted');
        }
      });
  }

  async onSaveChairReviewDate(decisionUuid: string, chairReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      chairReviewDate: formatDateForApi(chairReviewDate),
      chairReviewRequired: true,
    });
    await this.loadDecisions(this.fileNumber);
  }

  async onSaveAuditDate(decisionUuid: string, auditReviewDate: number) {
    await this.decisionService.update(decisionUuid, {
      auditDate: formatDateForApi(auditReviewDate),
    });
    await this.loadDecisions(this.fileNumber);
  }

  ngOnDestroy(): void {
    this.decisionService.cleanDecisions();
    this.$destroy.next();
    this.$destroy.complete();
  }
}
