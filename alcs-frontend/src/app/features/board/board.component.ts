import { ComponentType } from '@angular/cdk/portal';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';
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
  createCardTitle = '';

  private applicationTypes: ApplicationTypeDto[] = [];
  selectedBoardCode?: string;
  boards: BoardWithFavourite[] = [];
  cardDialogType: any = CreateApplicationDialogComponent;

  constructor(
    private applicationService: ApplicationService,
    private boardService: BoardService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private router: Router,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReviewService: PlanningReviewService
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

    this.boardService.$boards.pipe(takeUntil(this.destroy)).subscribe((boards) => {
      this.boards = boards;
      const selectedBoard = boards.find((board) => board.code === this.selectedBoardCode);
      if (selectedBoard) {
        this.setupBoard(selectedBoard);
      }
    });

    this.applicationService.$applicationTypes.pipe(takeUntil(this.destroy)).subscribe((types) => {
      this.applicationTypes = types;
    });

    // open card if cardUuid and type present in url
    const app = this.activatedRoute.snapshot.queryParamMap.get('card');
    const type = this.activatedRoute.snapshot.queryParamMap.get('type');
    if (app && type) {
      this.onSelected({ uuid: app, cardType: type as CardType });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async onSelected(card: CardSelectedEvent) {
    this.setUrl(card.uuid, card.cardType);
    switch (card.cardType) {
      case CardType.APP:
        await this.openAppCardDetailDialog(card.uuid);
        break;
      case CardType.RECON:
        await this.openReconCardDetailDialog(card.uuid);
        break;
      case CardType.PLAN:
        await this.openPlanningCardDialog(card.uuid);
        break;
      default:
        console.error('Card type is not configured for a dialog');
        this.toastService.showErrorToast('Failed to open card');
    }
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
        this.cardService
          .updateCard({
            uuid: $event.id,
            statusCode: $event.status,
          })
          .then((r) => {
            this.toastService.showSuccessToast('Card updated');
          });
        break;
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
    const allStatuses = board.statuses.map((status) => status.statusCode);

    this.columns = board.statuses.map((status) => ({
      status: status.statusCode,
      name: status.label,
      allowedTransitions: allStatuses,
    }));
  }

  private async loadCards(boardCode: string) {
    const apps = await this.boardService.fetchCards(boardCode);
    const mappedApps = apps.applications.map(this.mapApplicationDtoToCard.bind(this));
    const mappedRecons = apps.reconsiderations.map(this.mapReconsiderationDtoToCard.bind(this));
    const mappedReviewMeetings = apps.planningReviews.map(this.mapPlanningReviewToCard.bind(this));
    this.cards = [
      ...this.sortCards(boardCode, mappedApps),
      ...this.sortCards(boardCode, mappedRecons),
      ...this.sortCards(boardCode, mappedReviewMeetings),
    ];
  }

  private sortCards(boardCode: string, cards: CardData[]) {
    if (boardCode === BOARD_TYPE_CODES.VETT) {
      return cards.sort((a, b) => b.dateReceived - a.dateReceived);
    } else {
      return cards.sort((a, b) => {
        if (a.highPriority === b.highPriority) {
          return b.activeDays && a.activeDays ? b.activeDays - a.activeDays : 0;
        }
        if (a.highPriority) {
          return -1;
        } else {
          return 1;
        }
      });
    }
  }

  private mapApplicationDtoToCard(application: ApplicationDto): CardData {
    return {
      status: application.card.status.code,
      title: `${application.fileNumber} (${application.applicant})`,
      assignee: application.card.assignee,
      id: application.fileNumber,
      type: application.type,
      displayTypes: [application.type],
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
      displayTypes: [recon.application.type, RECON_TYPE_LABEL],
      type: RECON_TYPE_LABEL,
      cardType: CardType.RECON,
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
      type: PLANNING_TYPE_LABEL,
      displayTypes: [PLANNING_TYPE_LABEL],
      cardType: CardType.PLAN,
      paused: false,
      highPriority: meeting.card.highPriority,
      cardUuid: meeting.card.uuid,
      dateReceived: meeting.card.createdAt,
    };
  }

  private async openAppCardDetailDialog(id: string) {
    try {
      const application = await this.applicationService.fetchByCardUuid(id);
      this.openDialog(ApplicationDialogComponent, application);
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the application, please try again');
      console.error(err);
    }
  }

  private async openReconCardDetailDialog(id: string) {
    try {
      const recon = await this.reconsiderationService.fetchByCardUuid(id);
      this.openDialog(ReconsiderationDialogComponent, recon);
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the reconsideration, please try again');
      console.error(err);
    }
  }

  private async openPlanningCardDialog(id: string) {
    try {
      const planningReview = await this.planningReviewService.fetchByCardUuid(id);
      this.openDialog(PlanningReviewDialogComponent, planningReview);
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the planning review, please try again');
      console.error(err);
    }
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
    const url = this.router
      .createUrlTree([], {
        relativeTo: this.activatedRoute,
        queryParams: cardUuid && cardTypeCode ? { card: cardUuid, type: cardTypeCode } : {},
      })
      .toString();
    this.location.go(url);
  }
}
