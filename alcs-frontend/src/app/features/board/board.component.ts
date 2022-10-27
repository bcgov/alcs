import { ComponentType } from '@angular/cdk/portal';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationAmendmentDto } from '../../services/application/application-amendment/application-amendment.dto';
import { ApplicationAmendmentService } from '../../services/application/application-amendment/application-amendment.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { CardService } from '../../services/card/card.service';
import { PlanningReviewDto } from '../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../services/planning-review/planning-review.service';
import { ToastService } from '../../services/toast/toast.service';
import { CardData, CardSelectedEvent, CardType } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { AMENDMENT_TYPE_LABEL, AmendmentDialogComponent } from './dialogs/amendment/amendment-dialog.component';
import { CreateAmendmentDialogComponent } from './dialogs/amendment/create/create-amendment-dialog.component';
import { ApplicationDialogComponent } from './dialogs/application/application-dialog.component';
import { CreateApplicationDialogComponent } from './dialogs/application/create/create-application-dialog.component';
import { CreatePlanningReviewDialogComponent } from './dialogs/planning-review/create/create-planning-review-dialog.component';
import {
  PlanningReviewDialogComponent,
  PLANNING_TYPE_LABEL,
} from './dialogs/planning-review/planning-review-dialog.component';
import { CreateReconsiderationDialogComponent } from './dialogs/reconsiderations/create/create-reconsideration-dialog.component';
import {
  ReconsiderationDialogComponent,
  RECON_TYPE_LABEL,
} from './dialogs/reconsiderations/reconsideration-dialog.component';

export const BOARD_TYPE_CODES = {
  VETT: 'vett',
  EXEC: 'exec',
  CEO: 'ceo',
};

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  cards: CardData[] = [];
  columns: DragDropColumn[] = [];
  boardTitle = '';
  boardIsFavourite: boolean = false;
  boardHasPlanningReviews: boolean = false;
  boardHasAmendments: boolean = false;
  createCardTitle = '';

  selectedBoardCode?: string;
  boards: BoardWithFavourite[] = [];
  cardDialogType: any = CreateApplicationDialogComponent;

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
    private amendmentService: ApplicationAmendmentService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const boardCode = params['boardCode'];
      if (boardCode) {
        this.selectedBoardCode = boardCode;
        const selectedBoard = this.boards.find((board) => board.code === this.selectedBoardCode);

        if (selectedBoard) {
          this.setupBoard(selectedBoard);
        }
        this.setupCreateCardButton(boardCode);
      }
    });

    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      const app = queryParamMap.get('card');
      const type = queryParamMap.get('type');
      if (app && type) {
        this.openCardDialog({ uuid: app, cardType: type as CardType });
      }
    });

    this.boardService.$boards.pipe(takeUntil(this.destroy)).subscribe((boards) => {
      this.boards = boards;
      const selectedBoard = boards.find((board) => board.code === this.selectedBoardCode);
      if (selectedBoard) {
        this.setupBoard(selectedBoard);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async onSelected(card: CardSelectedEvent) {
    this.setUrl(card.uuid, card.cardType);
  }

  async onCreate() {
    this.openDialog(this.cardDialogType, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onCreatePlanningReview() {
    this.openDialog(CreatePlanningReviewDialogComponent, {
      currentBoardCode: this.selectedBoardCode,
    });
  }

  onCreateAmendment() {
    this.openDialog(CreateAmendmentDialogComponent, {
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
      case CardType.AMEND:
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

  private setupCreateCardButton(boardCode: string = '') {
    if (boardCode === BOARD_TYPE_CODES.VETT) {
      this.createCardTitle = '+ New Application';
      this.cardDialogType = CreateApplicationDialogComponent;
    } else {
      this.createCardTitle = '+ New Reconsideration';
      this.cardDialogType = CreateReconsiderationDialogComponent;
    }
  }

  private setupBoard(board: BoardWithFavourite) {
    this.loadCards(board.code);
    this.boardTitle = board.title;
    this.boardIsFavourite = board.isFavourite;
    this.boardHasPlanningReviews = board.code === BOARD_TYPE_CODES.EXEC;
    this.boardHasAmendments = board.code === BOARD_TYPE_CODES.CEO;
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
    const mappedAmendments = thingsWithCards.amendments.map(this.mapAmendmentToCard.bind(this));
    if (boardCode === BOARD_TYPE_CODES.VETT) {
      this.cards = [...mappedApps, ...mappedRecons, ...mappedReviewMeetings].sort((a, b) => {
        if (a.highPriority === b.highPriority) {
          return b.dateReceived - a.dateReceived;
        }
        return b.highPriority ? 1 : -1;
      });
    } else {
      const sorted = [];
      sorted.push(
        // high priority
        ...mappedApps.filter((a) => a.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
        ...mappedAmendments.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedRecons.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedReviewMeetings.filter((r) => r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        // none high priority
        ...mappedApps.filter((a) => !a.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
        ...mappedAmendments.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedRecons.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived),
        ...mappedReviewMeetings.filter((r) => !r.highPriority).sort((a, b) => a.dateReceived - b.dateReceived)
      );
      this.cards = sorted;
    }
  }

  private mapApplicationDtoToCard(application: ApplicationDto): CardData {
    return {
      status: application.card.status.code,
      title: `${application.fileNumber} (${application.applicant})`,
      assignee: application.card.assignee,
      id: application.fileNumber,
      labels: [application.type],
      activeDays: application.activeDays,
      paused: application.paused,
      highPriority: application.card.highPriority,
      decisionMeetings: application.decisionMeetings,
      cardType: CardType.APP,
      cardUuid: application.card.uuid,
      dateReceived: application.dateReceived,
    };
  }

  private mapReconsiderationDtoToCard(recon: ApplicationReconsiderationDto): CardData {
    return {
      status: recon.card.status.code,
      title: `${recon.application.fileNumber} (${recon.application.applicant})`,
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

  private mapAmendmentToCard(recon: ApplicationAmendmentDto): CardData {
    return {
      status: recon.card.status.code,
      title: `${recon.application.fileNumber} (${recon.application.applicant})`,
      assignee: recon.card.assignee,
      id: recon.card.uuid,
      labels: [recon.application.type, AMENDMENT_TYPE_LABEL],
      cardType: CardType.AMEND,
      paused: false,
      highPriority: recon.card.highPriority,
      cardUuid: recon.card.uuid,
      decisionMeetings: recon.application.decisionMeetings,
      dateReceived: recon.submittedDate,
    };
  }

  private mapPlanningReviewToCard(meeting: PlanningReviewDto): CardData {
    return {
      status: meeting.card.status.code,
      title: `${meeting.fileNumber} (${meeting.type})`,
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

  private openDialog(component: ComponentType<any>, data: any) {
    const dialogRef = this.dialog.open(component, {
      minWidth: '600px',
      maxWidth: '900px',
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
        case CardType.AMEND:
          const amendment = await this.amendmentService.fetchByCardUuid(card.uuid);
          this.openDialog(AmendmentDialogComponent, amendment);
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
