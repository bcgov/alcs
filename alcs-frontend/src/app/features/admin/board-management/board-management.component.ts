import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AdminBoardManagementService } from '../../../services/admin-board-management/admin-board-management.service';
import { BoardDto } from '../../../services/board/board.dto';
import { BoardService } from '../../../services/board/board.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { BoardManagementDialogComponent } from './board-management-dialog/board-management-dialog.component';

@Component({
  selector: 'app-board-management',
  templateUrl: './board-management.component.html',
  styleUrls: ['./board-management.component.scss'],
})
export class BoardManagementComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  boards: BoardDto[] = [];
  displayedColumns: string[] = ['boards', 'cardTypes', 'actions'];
  private cardTypes: BaseCodeDto[] = [];
  cardTypeMap: Record<string, string> = {};

  constructor(
    private boardService: BoardService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
    private adminBoardManagementService: AdminBoardManagementService
  ) {}

  ngOnInit(): void {
    this.boardService.$boards.pipe(takeUntil(this.$destroy)).subscribe((boards) => {
      this.boards = boards;
      this.boards.sort((a, b) => (a.title > b.title ? 1 : -1));
    });
    this.loadCardTypes();
  }

  async onCreate() {
    const dialog = this.dialog.open(BoardManagementDialogComponent, {
      minWidth: '800px',
      maxWidth: '1200px',
      width: '90%',
      data: {
        cardTypes: this.cardTypes,
      },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.boardService.reloadBoards();
      }
    });
  }

  async onEdit(boardDto: BoardDto) {
    const dialog = this.dialog.open(BoardManagementDialogComponent, {
      minWidth: '800px',
      maxWidth: '1200px',
      width: '90%',
      data: {
        board: boardDto,
        cardTypes: this.cardTypes,
      },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.boardService.reloadBoards();
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadCardTypes() {
    const res = await this.adminBoardManagementService.getCardTypes();
    if (res) {
      this.cardTypes = res;
      for (const type of res) {
        this.cardTypeMap[type.code] = type.label;
      }
    }
  }
}
