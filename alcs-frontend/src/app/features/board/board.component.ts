import { ComponentType } from '@angular/cdk/portal';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { CardService } from '../../services/card/card.service';
import { CovenantDto } from '../../services/covenant/covenant.dto';
import { CovenantService } from '../../services/covenant/covenant.service';
import { NoticeOfIntentModificationDto } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../services/notice-of-intent/notice-of-intent.service';
import { PlanningReviewDto } from '../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../services/planning-review/planning-review.service';
import { ToastService } from '../../services/toast/toast.service';
import {
  COVENANT_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  PLANNING_TYPE_LABEL,
  RECON_TYPE_LABEL,
  RETROACTIVE_TYPE_LABEL,
} from '../../shared/application-type-pill/application-type-pill.constants';
import { CardData, CardSelectedEvent, CardType } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { AppModificationDialogComponent } from './dialogs/app-modification/app-modification-dialog.component';
import { CreateAppModificationDialogComponent } from './dialogs/app-modification/create/create-app-modification-dialog.component';
import { ApplicationDialogComponent } from './dialogs/application/application-dialog.component';
import { CreateApplicationDialogComponent } from './dialogs/application/create/create-application-dialog.component';
import { CovenantDialogComponent } from './dialogs/covenant/covenant-dialog.component';
import { CreateCovenantDialogComponent } from './dialogs/covenant/create/create-covenant-dialog.component';
import { CreateNoiModificationDialogComponent } from './dialogs/noi-modification/create/create-noi-modification-dialog.component';
import { NoiModificationDialogComponent } from './dialogs/noi-modification/noi-modification-dialog.component';
import { CreateNoticeOfIntentDialogComponent } from './dialogs/notice-of-intent/create/create-notice-of-intent-dialog.component';
import { NoticeOfIntentDialogComponent } from './dialogs/notice-of-intent/notice-of-intent-dialog.component';
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
  boardTitle = '';
  boardIsFavourite = false;
  boardHasCreateApplication = false;
  boardHasCreatePlanningReview = false;
  boardHasCreateReconsideration = false;
  boardHasCreateAppModification = false;
  boardHasCreateCovenant = false;
  boardHasCreateNOI = false;
  boardHasCreateNOIModification = false;
  currentBoardCode = '';

  selectedBoardCode?: string;
  boards: BoardWithFavourite[] = [];

  constructor(
    private applicationService: ApplicationService,
    private boardService: BoardService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReviewService: PlanningReviewService,
    private modificationService: ApplicationModificationService,
    private covenantService: CovenantService,
    private noticeOfIntentService: NoticeOfIntentService,
    private noiModificationService: NoticeOfIntentModificationService,
    private titleService: Title
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

  onApplicationCreate() {
    this.openDialog(CreateApplicationDialogComponent, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onReconsiderationCreate() {
    this.openDialog(CreateReconsiderationDialogComponent, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onCreatePlanningReview() {
    this.openDialog(CreatePlanningReviewDialogComponent, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onCreateAppModification() {
    this.openDialog(CreateAppModificationDialogComponent, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onCreateCovenant() {
    this.openDialog(CreateCovenantDialogComponent, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onCreateNoticeOfIntent() {
    this.openDialog(CreateNoticeOfIntentDialogComponent, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onCreateNoiModifications() {
    this.openDialog(CreateNoiModificationDialogComponent, {
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
      case CardType.COV:
      case CardType.NOI:
      case CardType.NOI_MODI:
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

  private setupBoard(board: BoardWithFavourite) {
    // clear cards to remove flickering
    this.cards = [];
    this.titleService.setTitle(`${environment.siteName} | ${board.title} Board`);

    this.loadCards(board.code);
    this.boardTitle = board.title;
    this.boardIsFavourite = board.isFavourite;
    this.boardHasCreateApplication = board.code === BOARD_TYPE_CODES.VETT;
    this.boardHasCreatePlanningReview = board.code === BOARD_TYPE_CODES.EXEC;
    this.boardHasCreateReconsideration = ![BOARD_TYPE_CODES.VETT, BOARD_TYPE_CODES.NOI].includes(board.code);
    this.boardHasCreateAppModification = board.code === BOARD_TYPE_CODES.CEO;
    this.boardHasCreateCovenant = ![BOARD_TYPE_CODES.VETT, BOARD_TYPE_CODES.NOI].includes(board.code);
    this.boardHasCreateNOI = board.code === BOARD_TYPE_CODES.VETT;
    this.boardHasCreateNOIModification = board.code === BOARD_TYPE_CODES.NOI;

    const allStatuses = board.statuses.map((status) => status.statusCode);

    this.columns = board.statuses.map((status) => ({
      status: status.statusCode,
      name: status.label,
      allowedTransitions: allStatuses,
    }));
  }

  private async loadCards(boardCode: string) {
    const thingsWithCards = await this.boardService.fetchCards(boardCode);
    const mappedApps = thingsWithCards.applications.map(this.mapApplicationDtoToCard.bind(this));
    const mappedRecons = thingsWithCards.reconsiderations.map(this.mapReconsiderationDtoToCard.bind(this));
    const mappedReviewMeetings = thingsWithCards.planningReviews.map(this.mapPlanningReviewToCard.bind(this));
    const mappedModifications = thingsWithCards.modifications.map(this.mapModificationToCard.bind(this));
    const mappedCovenants = thingsWithCards.covenants.map(this.mapCovenantToCard.bind(this));
    const mappedNoticeOfIntents = thingsWithCards.noticeOfIntents.map(this.mapNoticeOfIntentToCard.bind(this));
    const mappedNoticeOfIntentModifications = thingsWithCards.noiModifications.map(
      this.mapNoticeOfIntentModificationToCard.bind(this)
    );
    if (boardCode === BOARD_TYPE_CODES.VETT) {
      this.cards = [
        ...mappedApps,
        ...mappedRecons,
        ...mappedModifications,
        ...mappedReviewMeetings,
        ...mappedCovenants,
        ...mappedNoticeOfIntents,
        ...mappedNoticeOfIntentModifications,
      ].sort((a, b) => {
        if (a.highPriority === b.highPriority) {
          return b.dateReceived - a.dateReceived;
        }
        return b.highPriority ? 1 : -1;
      });
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
        ...mappedReviewMeetings.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedCovenants.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
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
        ...mappedReviewMeetings.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedCovenants.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived)
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

  private mapPlanningReviewToCard(meeting: PlanningReviewDto): CardData {
    return {
      status: meeting.card.status.code,
      typeLabel: 'Non-Application',
      title: `${meeting.fileNumber} (${meeting.type})`,
      titleTooltip: meeting.type,
      assignee: meeting.card.assignee,
      id: meeting.card.uuid,
      labels: [PLANNING_TYPE_LABEL],
      cardType: CardType.PLAN,
      paused: false,
      highPriority: meeting.card.highPriority,
      cardUuid: meeting.card.uuid,
      dateReceived: meeting.card.createdAt,
    };
  }

  private mapCovenantToCard(covenant: CovenantDto): CardData {
    return {
      status: covenant.card.status.code,
      typeLabel: 'Non-Application',
      title: `${covenant.fileNumber} (${covenant.applicant})`,
      titleTooltip: covenant.applicant,
      assignee: covenant.card.assignee,
      id: covenant.card.uuid,
      labels: [COVENANT_TYPE_LABEL],
      cardType: CardType.COV,
      paused: false,
      highPriority: covenant.card.highPriority,
      cardUuid: covenant.card.uuid,
      dateReceived: covenant.card.createdAt,
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

  private openDialog(component: ComponentType<any>, data: any) {
    const dialogRef = this.dialog.open(component, {
      minWidth: '600px',
      maxWidth: '1100px',
      maxHeight: '80vh',
      width: '90%',
      data,
    });

    dialogRef.afterClosed().subscribe((isDirty) => {
      this.setUrl();

      if (isDirty && this.selectedBoardCode) {
        this.loadCards(this.selectedBoardCode);
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
          const planningReview = await this.planningReviewService.fetchByCardUuid(card.uuid);
          this.openDialog(PlanningReviewDialogComponent, planningReview);
          break;
        case CardType.MODI:
          const modification = await this.modificationService.fetchByCardUuid(card.uuid);
          this.openDialog(AppModificationDialogComponent, modification);
          break;
        case CardType.COV:
          const covenant = await this.covenantService.fetchByCardUuid(card.uuid);
          this.openDialog(CovenantDialogComponent, covenant);
          break;
        case CardType.NOI:
          const notceOfIntent = await this.noticeOfIntentService.fetchByCardUuid(card.uuid);
          this.openDialog(NoticeOfIntentDialogComponent, notceOfIntent);
          break;
        case CardType.NOI_MODI:
          const noiModification = await this.noiModificationService.fetchByCardUuid(card.uuid);
          this.openDialog(NoiModificationDialogComponent, noiModification);
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
