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
  UpdateNoticeOfIntentDecisionDto,
} from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import {
  DRAFT_DECISION_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_ONGOING_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
  DECISION_CONDITION_PENDING_LABEL,
  DECISION_CONDITION_EXPIRED_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';
import { RevertToDraftDialogComponent } from './revert-to-draft-dialog/revert-to-draft-dialog.component';
import { NoticeOfIntentConditionWithStatus, getEndDate } from '../../../../shared/utils/decision-methods';
import moment from 'moment';
import { FlagDialogComponent, FlagDialogIO } from '../../../../shared/flag-dialog/flag-dialog.component';
import { UserDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { UnFlagDialogComponent, UnFlagDialogIO } from '../../../../shared/unflag-dialog/unflag-dialog.component';

type LoadingDecision = NoticeOfIntentDecisionDto & {
  loading: boolean;
  canBeDeleted: boolean;
  index: number;
};

export const OUTCOMES_WITH_COMPONENTS = ['APPR', 'APPA', 'RESC'];

@Component({
    selector: 'app-noi-decision-v2',
    templateUrl: './decision-v2.component.html',
    styleUrls: ['./decision-v2.component.scss'],
    standalone: false
})
export class DecisionV2Component implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
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

  isSummary = false;

  conditions: Record<string, NoticeOfIntentConditionWithStatus[]> = {};
  profile: UserDto | undefined;

  constructor(
    public dialog: MatDialog,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
    private noticeOfIntentDecisionComponentService: NoticeOfIntentDecisionComponentService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private elementRef: ElementRef,
    private userService: UserService,
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

    this.userService.$userProfile.pipe(takeUntil(this.$destroy)).subscribe((profile) => {
      this.profile = profile;
    });
  }

  async loadDecisions(fileNumber: string) {
    const codes = await this.decisionService.fetchCodes();
    this.outcomes = codes.outcomes;
    this.decisionService.loadDecisions(fileNumber);

    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      this.decisions = decisions.map((decision) => {
        decision.conditions.map(async (x) => {
          if (x.components) {
            const componentId = x.components[0].uuid;
            if (componentId) {
              const conditionStatus = await this.decisionService.getStatus(x.uuid);
              if (this.conditions[componentId]) {
                this.conditions[componentId].push({
                  ...x,
                  conditionStatus: conditionStatus,
                });
              } else {
                this.conditions[componentId] = [
                  {
                    ...x,
                    conditionStatus: conditionStatus,
                  },
                ];
              }
            }
          }
        });
        return {
          ...decision,
          loading: false,
          canBeDeleted: decision.canDraftBeDeleted,
        };
      });

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

  async onCreate(existingUuid?: string) {
    const newDecision = await this.decisionService.create({
      resolutionYear: new Date().getFullYear(),
      isDraft: true,
      date: Date.now(),
      fileNumber: this.fileNumber,
      decisionToCopy: existingUuid,
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
        minWidth: '1080px',
        maxWidth: '1080px',
        maxHeight: '80vh',
        width: '90%',
        autoFocus: false,
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
    const index = this.decisions.find((x) => x.uuid === uuid)?.index;
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete Decision #${index} ?`,
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

  toggleSummary() {
    this.isSummary = !this.isSummary;
  }

  getConditions(uuid: string | undefined) {
    return uuid && this.conditions[uuid]
      ? [...new Set(this.conditions[uuid].map((x) => this.getPillLabel(x.conditionStatus.status)))].sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        })
      : [];
  }

  getDate(uuid: string | undefined) {
    return getEndDate(uuid, this.conditions);
  }

  async openFile(decisionUuid: string, fileUuid: string, fileName: string) {
    await this.decisionService.downloadFile(decisionUuid, fileUuid, fileName);
  }

  private getPillLabel(status: string) {
    switch (status) {
      case 'ONGOING':
        return DECISION_CONDITION_ONGOING_LABEL;
      case 'COMPLETED':
        return DECISION_CONDITION_COMPLETE_LABEL;
      case 'PASTDUE':
        return DECISION_CONDITION_PASTDUE_LABEL;
      case 'PENDING':
        return DECISION_CONDITION_PENDING_LABEL;
      case 'EXPIRED':
        return DECISION_CONDITION_EXPIRED_LABEL;
      default:
        return DECISION_CONDITION_ONGOING_LABEL;
    }
  }

  async flag(decision: LoadingDecision, index: number, isEditing: boolean) {
    this.dialog
      .open(FlagDialogComponent, {
        minWidth: '800px',
        maxWidth: '800px',
        maxHeight: '80vh',
        width: '90%',
        autoFocus: false,
        data: {
          isEditing,
          decisionNumber: index,
          reasonFlagged: decision.reasonFlagged,
          followUpAt: decision.followUpAt,
        },
      })
      .beforeClosed()
      .subscribe(async ({ isEditing, reasonFlagged, followUpAt, isSaving }: FlagDialogIO) => {
        if (isSaving) {
          const updateDto: UpdateNoticeOfIntentDecisionDto = {
            isDraft: decision.isDraft,
            isFlagged: true,
            reasonFlagged,
            flagEditedByUuid: this.profile?.uuid,
            flagEditedAt: moment().toDate().getTime(),
          };

          if (!isEditing) {
            updateDto.flaggedByUuid = this.profile?.uuid;
          }

          if (followUpAt !== undefined) {
            updateDto.followUpAt = followUpAt;
          }

          await this.decisionService.update(decision.uuid, updateDto);
          await this.loadDecisions(this.fileNumber);
        }
      });
  }

  async unflag(decision: LoadingDecision, index: number) {
    this.dialog
      .open(UnFlagDialogComponent, {
        minWidth: '800px',
        maxWidth: '800px',
        maxHeight: '80vh',
        width: '90%',
        autoFocus: false,
        data: {
          decisionNumber: index,
        },
      })
      .beforeClosed()
      .subscribe(async ({ confirmed }: UnFlagDialogIO) => {
        if (confirmed) {
          await this.decisionService.update(decision.uuid, {
            isDraft: decision.isDraft,
            isFlagged: false,
            reasonFlagged: null,
            followUpAt: null,
            flaggedByUuid: null,
            flagEditedByUuid: null,
            flagEditedAt: null,
          });
          await this.loadDecisions(this.fileNumber);
        }
      });
  }

  formatDate(timestamp?: number | null, includeTime = false): string {
    if (timestamp === undefined || timestamp === null) {
      return '';
    }

    return moment(new Date(timestamp)).format(`YYYY-MMM-DD ${includeTime ? 'hh:mm:ss A' : ''}`);
  }
}
