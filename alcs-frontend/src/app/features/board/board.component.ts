import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { ReconsiderationDto } from '../../services/card/card.dto';
import { CardService } from '../../services/card/card.service';
import { ToastService } from '../../services/toast/toast.service';
import { CardData, CardSelectedEvent } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { CardDetailDialogComponent } from './card-detail-dialog/card-detail-dialog.component';
import { CreateCardDialogComponent } from './create-card-detail-dialog/create-card-dialog.component';
import { CreateReconCardDialogComponent } from './recon-create-card-dialog/recon-create-card-dialog.component';

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
    private cardService: CardService
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

    // open card if application number present in url
    const app = this.activatedRoute.snapshot.queryParamMap.get('app');
    if (app) {
      // TODO this needs to read different parameters from url
      this.onSelected({ uuid: app, cardType: 'APP' });
    }
  }

  private setupCreateCardButton(boardCode: string = '') {
    if (boardCode === 'vett') {
      this.createCardTitle = '+ New Application';
      this.cardDialogType = CreateCardDialogComponent;
    } else {
      this.createCardTitle = '+ New Reconsideration';
      this.cardDialogType = CreateReconCardDialogComponent;
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
    console.log('loadApplications', this.cards);
  }

  private async openAppCardDetailDialog(id: string) {
    try {
      this.setUrl(id);

      const application = await this.applicationService.fetchApplication(id);

      const dialogRef = this.dialog.open(CardDetailDialogComponent, {
        minHeight: '500px',
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
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

  private async openReconCardDetailDialog(id: string) {
    try {
      this.setUrl(id);

      const application = await this.cardService.fetchCard(id);

      const dialogRef = this.dialog.open(CardDetailDialogComponent, {
        minHeight: '500px',
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
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

  async onSelected(card: CardSelectedEvent) {
    console.log('onSelected', card);
    switch (card.cardType) {
      case 'APP':
        this.openAppCardDetailDialog(card.uuid);
        break;
      case 'RECON':
        this.openReconCardDetailDialog(card.uuid);
        break;
    }
  }

  private setUrl(id: string = '') {
    const url = this.router
      .createUrlTree([], { relativeTo: this.activatedRoute, queryParams: id ? { app: id } : {} })
      .toString();
    this.location.go(url);
  }

  async onCreate() {
    this.dialog
      .open(this.cardDialogType, {
        minWidth: '600px',
        maxWidth: '900px',
        width: '100%',
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

  onDropped($event: { id: string; status: string }) {
    this.applicationService
      .updateApplicationCard({
        fileNumber: $event.id,
        status: $event.status,
      })
      .then((r) => {
        this.toastService.showSuccessToast('Application Updated');
      });
  }

  private mapApplicationDtoToCard(application: ApplicationDto): CardData {
    const mappedType = this.applicationTypes.find((type) => type.code === application.type);
    return {
      status: application.status,
      title: `${application.fileNumber} (${application.applicant})`,
      assigneeInitials: application.assignee?.initials,
      id: application.fileNumber,
      type: mappedType!,
      activeDays: application.activeDays,
      paused: application.paused,
      highPriority: application.highPriority,
      decisionMeetings: application.decisionMeetings,
      cardType: application.card.type,
    };
  }

  private mapReconsiderationDtoToCard(recon: ReconsiderationDto): CardData {
    console.log('mapReconsiderationDtoToCard', recon);
    // TODO get mock fields from application linked to reconsideration
    return {
      status: recon.status,
      title: 'Mock, get from application',
      assigneeInitials: recon.assignee?.initials,
      id: recon.uuid,
      type: {
        label: 'Recon',
        code: 'RECON',
        shortLabel: 'RECON',
        backgroundColor: '#454545',
        description: 'Reconsideration',
        textColor: 'white',
      },
      cardType: 'RECON',
      paused: false,
      highPriority: recon.highPriority,
    };
  }
}
