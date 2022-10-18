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
  PLANNING_TYPE_LABEL,
  PlanningReviewDialogComponent,
} from './dialogs/planning-review/planning-review-dialog.component';
import { CreateReconsiderationDialogComponent } from './dialogs/reconsiderations/create/create-reconsideration-dialog.component';
import {
  RECON_TYPE_LABEL,
  ReconsiderationDialogComponent,
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
    const app = this.activatedRoute.snapshot.queryParamMap.get('app');
    const type = this.activatedRoute.snapshot.queryParamMap.get('type');
    if (app && type) {
      this.onSelected({ uuid: app, cardType: type as CardType });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
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

  private async openAppCardDetailDialog(id: string, cardTypeCode: string) {
    try {
      this.setUrl(id, cardTypeCode);

      const application = await this.applicationService.fetchApplication(id);

      const dialogRef = this.dialog.open(ApplicationDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: application,
      });

      dialogRef.afterClosed().subscribe((isDirty) => {
        this.setUrl();

        if (isDirty && this.selectedBoardCode) {
          this.loadCards(this.selectedBoardCode);
        }
      });
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the application, please try again');
      console.error(err);
    }
  }

  private async openReconCardDetailDialog(id: string, cardTypeCode: string) {
    try {
      this.setUrl(id, cardTypeCode);

      const recon = await this.reconsiderationService.fetchByCardUuid(id);

      const dialogRef = this.dialog.open(ReconsiderationDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: recon,
      });

      dialogRef.afterClosed().subscribe((isDirty) => {
        this.setUrl();

        if (isDirty && this.selectedBoardCode) {
          this.loadCards(this.selectedBoardCode);
        }
      });
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the application, please try again');
      console.error(err);
    }
  }

  private async openPlanningCardDialog(id: string, cardTypeCode: string) {
    try {
      this.setUrl(id, cardTypeCode);

      const planningReview = await this.planningReviewService.fetchByCardUuid(id);

      const dialogRef = this.dialog.open(PlanningReviewDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: planningReview,
      });

      dialogRef.afterClosed().subscribe((isDirty) => {
        this.setUrl();

        if (isDirty && this.selectedBoardCode) {
          this.loadCards(this.selectedBoardCode);
        }
      });
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the application, please try again');
      console.error(err);
    }
  }

  async onSelected(card: CardSelectedEvent) {
    switch (card.cardType) {
      case CardType.APP:
        await this.openAppCardDetailDialog(card.uuid, card.cardType);
        break;
      case CardType.RECON:
        await this.openReconCardDetailDialog(card.uuid, card.cardType);
        break;
      case CardType.PLAN:
        await this.openPlanningCardDialog(card.uuid, card.cardType);
        break;
      default:
        console.error('Card type is not configured for a dialog');
    }
  }

  private setUrl(cardUuid: string = '', cardTypeCode: string = '') {
    const url = this.router
      .createUrlTree([], {
        relativeTo: this.activatedRoute,
        queryParams: cardUuid && cardTypeCode ? { app: cardUuid, type: cardTypeCode } : {},
      })
      .toString();
    this.location.go(url);
  }

  async onCreate() {
    this.dialog
      .open(this.cardDialogType, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          currentBoardCode: this.selectedBoardCode,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate && this.selectedBoardCode) {
          this.loadCards(this.selectedBoardCode);
        }
      });
  }

  onCreatePlanningReview() {
    this.dialog
      .open(CreatePlanningReviewDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          currentBoardCode: this.selectedBoardCode,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate && this.selectedBoardCode) {
          this.loadCards(this.selectedBoardCode);
        }
      });
  }

  onDropped($event: { id: string; status: string; cardTypeCode: CardType }) {
    switch ($event.cardTypeCode) {
      case CardType.APP:
        this.applicationService
          .updateApplicationCard($event.id, {
            status: $event.status,
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

  private mapApplicationDtoToCard(application: ApplicationDto): CardData {
    const mappedType = this.applicationTypes.find((type) => type.code === application.type);
    return {
      status: application.status,
      title: `${application.fileNumber} (${application.applicant})`,
      assignee: application.card.assignee,
      id: application.fileNumber,
      type: mappedType!,
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
      cardType: CardType.PLAN,
      paused: false,
      highPriority: meeting.card.highPriority,
      cardUuid: meeting.card.uuid,
      dateReceived: meeting.card.createdAt,
    };
  }
}
