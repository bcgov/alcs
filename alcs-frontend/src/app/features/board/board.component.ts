import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { ToastService } from '../../services/toast/toast.service';
import { CardData } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { CardDetailDialogComponent } from './card-detail-dialog/card-detail-dialog.component';
import { CreateCardDialogComponent } from './create-card-detail-dialog/create-card-dialog.component';

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

  private applicationTypes: ApplicationTypeDto[] = [];
  selectedBoardCode?: string;
  boards: BoardWithFavourite[] = [];

  constructor(
    private applicationService: ApplicationService,
    private boardService: BoardService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private router: Router
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
      this.onSelected(app);
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
    this.cards = apps.map(this.mapApplicationDtoToCard.bind(this));
  }

  async onSelected(id: string) {
    try {
      this.setUrl(id);

      const application = await this.applicationService.fetchApplication(id);

      const dialogRef = this.dialog.open(CardDetailDialogComponent, {
        minHeight: '500px',
        minWidth: '600px',
        maxWidth: '800px',
        height: '80%',
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

  private setUrl(id: string = '') {
    const url = this.router
      .createUrlTree([], { relativeTo: this.activatedRoute, queryParams: id ? { app: id } : {} })
      .toString();
    this.location.go(url);
  }

  async onCreate() {
    this.dialog
      .open(CreateCardDialogComponent, {
        minHeight: '500px',
        minWidth: '600px',
        maxWidth: '800px',
        height: '80%',
        width: '70%',
        data: {},
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
      .updateApplication({
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
    };
  }
}
