import { ComponentType } from '@angular/cdk/portal';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { CardsDto } from '../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { CardService } from '../../services/card/card.service';
import { NoticeOfIntentModificationDto } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../services/notice-of-intent/notice-of-intent.service';
import { NotificationDto } from '../../services/notification/notification.dto';
import { NotificationService } from '../../services/notification/notification.service';
import { PlanningReferralService } from '../../services/planning-review/planning-referral.service';
import { PlanningReferralDto } from '../../services/planning-review/planning-review.dto';
import { ToastService } from '../../services/toast/toast.service';
import {
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
  RETROACTIVE_TYPE_LABEL,
} from '../../shared/application-type-pill/application-type-pill.constants';
import { CardData, CardSelectedEvent, CardType } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { AppModificationDialogComponent } from './dialogs/app-modification/app-modification-dialog.component';
import { CreateAppModificationDialogComponent } from './dialogs/app-modification/create/create-app-modification-dialog.component';
import { ApplicationDialogComponent } from './dialogs/application/application-dialog.component';
import { CreateNoiModificationDialogComponent } from './dialogs/noi-modification/create/create-noi-modification-dialog.component';
import { NoiModificationDialogComponent } from './dialogs/noi-modification/noi-modification-dialog.component';
import { NoticeOfIntentDialogComponent } from './dialogs/notice-of-intent/notice-of-intent-dialog.component';
import { NotificationDialogComponent } from './dialogs/notification/notification-dialog.component';
import { CreatePlanningReviewDialogComponent } from './dialogs/planning-review/create/create-planning-review-dialog.component';
import { PlanningReviewDialogComponent } from './dialogs/planning-review/planning-review-dialog.component';
import { CreateReconsiderationDialogComponent } from './dialogs/reconsiderations/create/create-reconsideration-dialog.component';
import { ReconsiderationDialogComponent } from './dialogs/reconsiderations/reconsideration-dialog.component';

export const BOARD_TYPE_CODES = {
  VETT: 'vett',
  EXEC: 'exec',
  CEO: 'ceo',
  NOI: 'noi',
};

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  cards: CardData[] = [];
  columns: DragDropColumn[] = [];
  boards: BoardWithFavourite[] = [];
  boardTitle = '';
  boardIsFavourite = false;
  currentBoardCode = '';
  selectedBoardCode?: string;
  creatableCards: {
    label: string;
    dialog: ComponentType<any>;
  }[] = [];

  private createCardMap = new Map<
    CardType,
    {
      label: string;
      dialog: ComponentType<any>;
    }
  >([
    [
      CardType.RECON,
      {
        label: 'Reconsideration',
        dialog: CreateReconsiderationDialogComponent,
      },
    ],
    [
      CardType.MODI,
      {
        label: 'Application Modification',
        dialog: CreateAppModificationDialogComponent,
      },
    ],
    [
      CardType.NOI_MODI,
      {
        label: 'NOI Modification',
        dialog: CreateNoiModificationDialogComponent,
      },
    ],
    [
      CardType.PLAN,
      {
        label: 'Planning Review',
        dialog: CreatePlanningReviewDialogComponent,
      },
    ],
  ]);

  constructor(
    private applicationService: ApplicationService,
    private boardService: BoardService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReferralService: PlanningReferralService,
    private modificationService: ApplicationModificationService,
    private noticeOfIntentService: NoticeOfIntentService,
    private noiModificationService: NoticeOfIntentModificationService,
    private notificationService: NotificationService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.pipe(takeUntil(this.$destroy)).subscribe((params) => {
      const boardCode = params['boardCode'];
      if (boardCode) {
        this.selectedBoardCode = boardCode;
        const selectedBoard = this.boards.find((board) => board.code === this.selectedBoardCode);

        if (selectedBoard) {
          this.setupBoard(selectedBoard);
        }
        this.currentBoardCode = boardCode;
      }
    });

    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      const app = queryParamMap.get('card');
      const type = queryParamMap.get('type');
      if (app && type) {
        this.openCardDialog({ uuid: app, cardType: type as CardType });
      }
    });

    this.boardService.$boards.pipe(takeUntil(this.$destroy)).subscribe((boards) => {
      this.boards = boards;
      const selectedBoard = boards.find((board) => board.code === this.selectedBoardCode);
      if (selectedBoard) {
        this.setupBoard(selectedBoard);
      }
    });
  }

  ngOnDestroy(): void {
    this.cards = [];
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSelected(card: CardSelectedEvent) {
    this.setUrl(card.uuid, card.cardType);
  }

  onOpenCreateDialog(component: ComponentType<any>) {
    this.openDialog(component, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onDropped($event: { id: string; status: string; cardTypeCode: CardType }) {
    switch ($event.cardTypeCode) {
      case CardType.APP:
        this.applicationService
          .updateApplicationCard($event.id, {
            statusCode: $event.status,
          })
          .then((r) => {
            this.toastService.showSuccessToast('Application updated');
          });
        break;
      case CardType.RECON:
      case CardType.PLAN:
      case CardType.MODI:
      case CardType.NOI:
      case CardType.NOI_MODI:
      case CardType.NOTIFICATION:
        this.cardService
          .updateCard({
            uuid: $event.id,
            statusCode: $event.status,
          })
          .then((r) => {
            this.toastService.showSuccessToast('Card updated');
          });
        break;
      default:
        console.error('Card type is not configured for dropped event');
    }
  }

  private async setupBoard(board: BoardWithFavourite) {
    // clear cards to remove flickering
    this.cards = [];
    this.titleService.setTitle(`${environment.siteName} | ${board.title} Board`);
    this.boardIsFavourite = board.isFavourite;

    this.loadBoard(board.code);
  }

  private async loadBoard(boardCode: string) {
    const response = await this.boardService.fetchBoardWithCards(boardCode);
    const board = response.board;

    this.boardTitle = board.title;

    const creatableCards: {
      label: string;
      dialog: ComponentType<any>;
    }[] = [];
    for (const cardType of board.createCardTypes) {
      const creator = this.createCardMap.get(cardType);
      if (creator) {
        creatableCards.push(creator);
      }
    }
    this.creatableCards = creatableCards;

    const allStatuses = board.statuses.map((status) => status.statusCode);

    this.columns = board.statuses.map((status) => ({
      status: status.statusCode,
      name: status.label,
      allowedTransitions: allStatuses,
    }));
    this.mapAndSortCards(response, boardCode);
  }

  private mapAndSortCards(response: CardsDto, boardCode: string) {
    const mappedApps = response.applications.map(this.mapApplicationDtoToCard.bind(this));
    const mappedRecons = response.reconsiderations.map(this.mapReconsiderationDtoToCard.bind(this));
    const mappedPlanningReferrals = response.planningReferrals.map(this.mapPlanningReferralToCard.bind(this));
    const mappedModifications = response.modifications.map(this.mapModificationToCard.bind(this));
    const mappedNoticeOfIntents = response.noticeOfIntents.map(this.mapNoticeOfIntentToCard.bind(this));
    const mappedNoticeOfIntentModifications = response.noiModifications.map(
      this.mapNoticeOfIntentModificationToCard.bind(this),
    );
    const mappedNotifications = response.notifications.map(this.mapNotificationToCard.bind(this));
    if (boardCode === BOARD_TYPE_CODES.VETT) {
      const vettingSort = (a: CardData, b: CardData) => {
        if (a.highPriority === b.highPriority) {
          return b.dateReceived - a.dateReceived;
        }
        return b.highPriority ? 1 : -1;
      };
      this.cards = [
        ...[...mappedNoticeOfIntents, ...mappedNoticeOfIntentModifications].sort(vettingSort),
        ...[...mappedApps, ...mappedRecons, ...mappedModifications].sort(vettingSort),
        ...[...mappedPlanningReferrals].sort(vettingSort),
        ...mappedNotifications,
      ];
    } else if (boardCode === BOARD_TYPE_CODES.NOI) {
      const noiSort = (a: CardData, b: CardData) => {
        if (a.paused !== b.paused) {
          return b.paused ? -1 : 1;
        }
        if (a.highPriority !== b.highPriority) {
          return b.highPriority ? 1 : -1;
        }

        if (b.pausedDays !== undefined && a.pausedDays !== undefined) {
          return b.pausedDays - a.pausedDays;
        }

        return (b.activeDays ?? 0) - (a.activeDays ?? 0);
      };
      this.cards = [
        ...mappedNoticeOfIntents,
        ...mappedNoticeOfIntentModifications,
        ...mappedApps,
        ...mappedRecons,
        ...mappedModifications,
        ...mappedPlanningReferrals,
        ...mappedNotifications,
      ].sort(noiSort);
    } else {
      const sorted = [];
      sorted.push(
        // high priority
        ...mappedNoticeOfIntents.filter((a) => a.highPriority).sort((a, b) => b.activeDays ?? 0 - (a.activeDays ?? 0)),
        ...mappedNoticeOfIntentModifications
          .filter((a) => a.highPriority)
          .sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedApps.filter((a) => a.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
        ...mappedModifications.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedRecons.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedPlanningReferrals.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedNotifications.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        // non-high priority
        ...mappedNoticeOfIntents
          .filter((a) => !a.highPriority)
          .sort((a, b) => (b.activeDays ?? 0) - (a.activeDays ?? 0)),
        ...mappedNoticeOfIntentModifications
          .filter((a) => !a.highPriority)
          .sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedApps.filter((a) => !a.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
        ...mappedModifications.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedRecons.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedPlanningReferrals.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedNotifications.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
      );
      this.cards = sorted;
    }
  }

  private mapApplicationDtoToCard(application: ApplicationDto): CardData {
    return {
      status: application.card!.status.code,
      typeLabel: 'Application',
      title: `${application.fileNumber} (${application.applicant})`,
      titleTooltip: application.applicant,
      assignee: application.card!.assignee,
      id: application.fileNumber,
      labels: [application.type],
      activeDays: application.activeDays,
      paused: application.paused,
      highPriority: application.card!.highPriority,
      decisionMeetings: application.decisionMeetings,
      cardType: CardType.APP,
      cardUuid: application.card!.uuid,
      dateReceived: application.dateSubmittedToAlc,
      legacyId: application.legacyId,
    };
  }

  private mapReconsiderationDtoToCard(recon: ApplicationReconsiderationDto): CardData {
    return {
      status: recon.card.status.code,
      typeLabel: 'Application',
      title: `${recon.application.fileNumber} (${recon.application.applicant})`,
      titleTooltip: recon.application.applicant,
      assignee: recon.card.assignee,
      id: recon.card.uuid,
      labels: [recon.application.type, RECON_TYPE_LABEL],
      cardType: CardType.RECON,
      paused: false,
      highPriority: recon.card.highPriority,
      cardUuid: recon.card.uuid,
      decisionMeetings: recon.application.decisionMeetings,
      dateReceived: recon.submittedDate,
    };
  }

  private mapModificationToCard(modification: ApplicationModificationDto): CardData {
    return {
      status: modification.card.status.code,
      typeLabel: 'Application',
      title: `${modification.application.fileNumber} (${modification.application.applicant})`,
      titleTooltip: modification.application.applicant,
      assignee: modification.card.assignee,
      id: modification.card.uuid,
      labels: [modification.application.type, MODIFICATION_TYPE_LABEL],
      cardType: CardType.MODI,
      paused: false,
      highPriority: modification.card.highPriority,
      cardUuid: modification.card.uuid,
      decisionMeetings: modification.application.decisionMeetings,
      dateReceived: modification.submittedDate,
    };
  }

  private mapPlanningReferralToCard(referral: PlanningReferralDto): CardData {
    return {
      status: referral.card.status.code,
      typeLabel: 'Planning Review',
      title: `${referral.planningReview.fileNumber} (${referral.planningReview.documentName})`,
      titleTooltip: referral.planningReview.type.label,
      assignee: referral.card.assignee,
      id: referral.card.uuid,
      labels: [referral.planningReview.type],
      cardType: CardType.PLAN,
      paused: false,
      highPriority: referral.card.highPriority,
      cardUuid: referral.card.uuid,
      dateReceived: referral.card.createdAt,
      dueDate: referral.dueDate ? new Date(referral.dueDate) : undefined,
      showDueDate: true,
    };
  }

  private mapNoticeOfIntentToCard(noticeOfIntent: NoticeOfIntentDto): CardData {
    return {
      status: noticeOfIntent.card.status.code,
      typeLabel: 'Notice of Intent',
      title: `${noticeOfIntent.fileNumber} (${noticeOfIntent.applicant})`,
      titleTooltip: noticeOfIntent.applicant,
      assignee: noticeOfIntent.card.assignee,
      id: noticeOfIntent.card.uuid,
      labels: noticeOfIntent.retroactive ? [RETROACTIVE_TYPE_LABEL] : [],
      cardType: CardType.NOI,
      paused: noticeOfIntent.paused,
      highPriority: noticeOfIntent.card.highPriority,
      cardUuid: noticeOfIntent.card.uuid,
      dateReceived: noticeOfIntent.card.createdAt,
      cssClasses: ['notice-of-intent'],
      activeDays: noticeOfIntent.activeDays ?? undefined,
      pausedDays: noticeOfIntent.pausedDays ?? undefined,
      dueDate: noticeOfIntent.activeDays
        ? moment().add(60, 'days').subtract(noticeOfIntent.activeDays, 'days').toDate()
        : undefined,
      maxActiveDays: 61,
      legacyId: noticeOfIntent.legacyId,
    };
  }

  private mapNoticeOfIntentModificationToCard(noticeOfIntentModification: NoticeOfIntentModificationDto): CardData {
    return {
      status: noticeOfIntentModification.card.status.code,
      typeLabel: 'Notice of Intent',
      title: `${noticeOfIntentModification.noticeOfIntent.fileNumber} (${noticeOfIntentModification.noticeOfIntent.applicant})`,
      titleTooltip: noticeOfIntentModification.noticeOfIntent.applicant,
      assignee: noticeOfIntentModification.card.assignee,
      id: noticeOfIntentModification.card.uuid,
      labels: noticeOfIntentModification.noticeOfIntent.retroactive
        ? [MODIFICATION_TYPE_LABEL, RETROACTIVE_TYPE_LABEL]
        : [MODIFICATION_TYPE_LABEL],
      cardType: CardType.NOI_MODI,
      paused: false,
      highPriority: noticeOfIntentModification.card.highPriority,
      cardUuid: noticeOfIntentModification.card.uuid,
      dateReceived: noticeOfIntentModification.card.createdAt,
      cssClasses: ['notice-of-intent'],
    };
  }

  private mapNotificationToCard(notification: NotificationDto): CardData {
    return {
      status: notification.card.status.code,
      typeLabel: 'Notification',
      title: `${notification.fileNumber} (${notification.applicant})`,
      titleTooltip: notification.applicant,
      assignee: notification.card.assignee,
      id: notification.card.uuid,
      labels: [notification.type],
      cardType: CardType.NOTIFICATION,
      paused: false,
      highPriority: notification.card.highPriority,
      cardUuid: notification.card.uuid,
      dateReceived: notification.card.createdAt,
      cssClasses: ['notification'],
    };
  }

  private openDialog(component: ComponentType<any>, data: any) {
    const dialogRef = this.dialog.open(component, {
      minWidth: '600px',
      maxWidth: '1100px',
      maxHeight: '80vh',
      width: '90%',
      data,
    });

    dialogRef.beforeClosed().subscribe((isDirty) => {
      this.setUrl();

      if (isDirty && this.selectedBoardCode) {
        this.loadBoard(this.selectedBoardCode);
      }
    });
  }

  private setUrl(cardUuid?: string, cardTypeCode?: CardType) {
    this.router.navigate(this.activatedRoute.snapshot.url, {
      queryParams: cardUuid && cardTypeCode ? { card: cardUuid, type: cardTypeCode } : {},
      relativeTo: this.activatedRoute,
    });
  }

  private async openCardDialog(card: CardSelectedEvent) {
    try {
      switch (card.cardType) {
        case CardType.APP:
          const application = await this.applicationService.fetchByCardUuid(card.uuid);
          this.openDialog(ApplicationDialogComponent, application);
          break;
        case CardType.RECON:
          const recon = await this.reconsiderationService.fetchByCardUuid(card.uuid);
          this.openDialog(ReconsiderationDialogComponent, recon);
          break;
        case CardType.PLAN:
          const planningReview = await this.planningReferralService.fetchByCardUuid(card.uuid);
          this.openDialog(PlanningReviewDialogComponent, planningReview);
          break;
        case CardType.MODI:
          const modification = await this.modificationService.fetchByCardUuid(card.uuid);
          this.openDialog(AppModificationDialogComponent, modification);
          break;
        case CardType.NOI:
          const notceOfIntent = await this.noticeOfIntentService.fetchByCardUuid(card.uuid);
          this.openDialog(NoticeOfIntentDialogComponent, notceOfIntent);
          break;
        case CardType.NOI_MODI:
          const noiModification = await this.noiModificationService.fetchByCardUuid(card.uuid);
          this.openDialog(NoiModificationDialogComponent, noiModification);
          break;
        case CardType.NOTIFICATION:
          const notification = await this.notificationService.fetchByCardUuid(card.uuid);
          this.openDialog(NotificationDialogComponent, notification);
          break;
        default:
          console.error('Card type is not configured for a dialog');
          this.toastService.showErrorToast('Failed to open card');
      }
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the card, please try again');
      console.error(err);
    }
  }
}
