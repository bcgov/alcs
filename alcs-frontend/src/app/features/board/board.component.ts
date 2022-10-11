import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { CardService } from '../../services/card/card.service';
import { ToastService } from '../../services/toast/toast.service';
import { CardData, CardSelectedEvent } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { CardDetailDialogComponent } from './card-detail-dialog/card-detail-dialog.component';
import { CreateCardDialogComponent } from './create-card-detail-dialog/create-card-dialog.component';
import {
  ReconCardDetailDialogComponent,
  RECON_TYPE_LABEL,
} from './recon-card-detail-dialog/recon-card-detail-dialog.component';
import { ReconCreateCardDialogComponent } from './recon-create-card-dialog/recon-create-card-dialog.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  cards: CardData[] = [];
  columns: DragDropColumn[] = [];
  boardTitle = '';
  boardIsFavourite: boolean = false;
  createCardTitle = '';

  private applicationTypes: ApplicationTypeDto[] = [];
  selectedBoardCode?: string;
  boards: BoardWithFavourite[] = [];
  cardDialogType: any = CreateCardDialogComponent;

  constructor(
    private applicationService: ApplicationService,
    private boardService: BoardService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private router: Router,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
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

    this.boardService.$boards.subscribe((boards) => {
      this.boards = boards;
      const selectedBoard = boards.find((board) => board.code === this.selectedBoardCode);
      if (selectedBoard) {
        this.setupBoard(selectedBoard);
      }
    });

    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });

    // open card if cardUuid and type present in url
    const app = this.activatedRoute.snapshot.queryParamMap.get('app');
    const type = this.activatedRoute.snapshot.queryParamMap.get('type');
    if (app && type) {
      this.onSelected({ uuid: app, cardType: type });
    }
  }

  private setupCreateCardButton(boardCode: string = '') {
    if (boardCode === 'vett') {
      this.createCardTitle = '+ New Application';
      this.cardDialogType = CreateCardDialogComponent;
    } else {
      this.createCardTitle = '+ New Reconsideration';
      this.cardDialogType = ReconCreateCardDialogComponent;
    }
  }

  private setupBoard(board: BoardWithFavourite) {
    this.loadApplications(board.code);
    this.boardTitle = board.title;
    this.boardIsFavourite = board.isFavourite;
    const allStatuses = board.statuses.map((status) => status.statusCode);

    this.columns = board.statuses.map((status) => ({
      status: status.statusCode,
      name: status.label,
      allowedTransitions: allStatuses,
    }));
  }

  private async loadApplications(boardCode: string) {
    const apps = await this.boardService.fetchApplications(boardCode);
    this.cards = apps.applications.map(this.mapApplicationDtoToCard.bind(this));
    this.cards = this.cards.concat(apps.reconsiderations.map(this.mapReconsiderationDtoToCard.bind(this)));
  }

  private async openAppCardDetailDialog(id: string, cardTypeCode: string) {
    try {
      this.setUrl(id, cardTypeCode);

      const application = await this.applicationService.fetchApplication(id);

      const dialogRef = this.dialog.open(CardDetailDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: application,
      });

      dialogRef.afterClosed().subscribe((isDirty) => {
        this.setUrl();

        if (isDirty && this.selectedBoardCode) {
          this.loadApplications(this.selectedBoardCode);
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

      const dialogRef = this.dialog.open(ReconCardDetailDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: recon,
      });

      dialogRef.afterClosed().subscribe((isDirty) => {
        this.setUrl();

        if (isDirty && this.selectedBoardCode) {
          this.loadApplications(this.selectedBoardCode);
        }
      });
    } catch (err) {
      this.toastService.showErrorToast('There was an issue loading the application, please try again');
      console.error(err);
    }
  }

  async onSelected(card: CardSelectedEvent) {
    switch (card.cardType) {
      case 'APP':
        await this.openAppCardDetailDialog(card.uuid, card.cardType);
        break;
      case 'RECON':
        await this.openReconCardDetailDialog(card.uuid, card.cardType);
        break;
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
          this.loadApplications(this.selectedBoardCode);
        }
      });
  }

  onDropped($event: { id: string; status: string; cardTypeCode: string }) {
    switch ($event.cardTypeCode) {
      case 'APP':
        this.applicationService
          .updateApplicationCard($event.id, {
            status: $event.status,
          })
          .then((r) => {
            this.toastService.showSuccessToast('Application updated');
          });
        break;
      case 'RECON':
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
      cardType: application.card.type,
      cardUuid: application.card.uuid,
    };
  }

  private mapReconsiderationDtoToCard(recon: ApplicationReconsiderationDto): CardData {
    // TODO get mock fields from application linked to reconsideration
    console.log(recon);
    return {
      status: recon.card.status.code,
      title: `${recon.application.fileNumber} (${recon.application.applicant})`,
      // title: `${recon.fileNumber} (${application.applicant})`,
      assignee: recon.card.assignee,
      id: recon.card.uuid,
      type: RECON_TYPE_LABEL,
      cardType: 'RECON',
      paused: false,
      highPriority: recon.card.highPriority,
      cardUuid: recon.card.uuid,
    };
  }
}
