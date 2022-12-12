import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { BoardStatusDto } from '../../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { CovenantDto } from '../../../../services/covenant/covenant.dto';
import { CovenantService } from '../../../../services/covenant/covenant.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { COVENANT_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-covenant-dialog',
  templateUrl: './covenant-dialog.component.html',
  styleUrls: ['./covenant-dialog.component.scss'],
})
export class CovenantDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<AssigneeDto[]> | undefined;
  selectedAssignee?: AssigneeDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;
  title?: string;
  covenantType = COVENANT_TYPE_LABEL;

  covenant: CovenantDto = this.data;
  isDirty = false;

  boardStatuses: BoardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CovenantDto,
    private dialogRef: MatDialogRef<CovenantDialogComponent>,
    private userService: UserService,
    private cardService: CardService,
    private boardService: BoardService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
    private covenantService: CovenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.populateData(this.data);

    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.isDirty);
    });

    this.boardService.$boards.pipe(takeUntil(this.$destroy)).subscribe((boards) => {
      this.boards = boards;
      const loadedBoard = boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }
    });

    this.title = `${this.covenant.fileNumber} (${this.covenant.applicant})`;
  }

  populateData(covenant: CovenantDto) {
    this.covenant = covenant;
    this.selectedAssignee = covenant.card.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.prettyName;
    this.selectedApplicationStatus = covenant.card.status.code;
    this.selectedBoard = covenant.card.board.code;
    this.selectedRegion = covenant.region.code;
    this.$users = this.userService.$assignableUsers;
    this.userService.fetchAssignableUsers();
  }

  filterAssigneeList(term: string, item: AssigneeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 ||
      item.prettyName.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onAssigneeSelected(assignee: AssigneeDto) {
    this.selectedAssignee = assignee;
    this.covenant.card.assignee = assignee;
    this.updateCard({
      assigneeUuid: assignee?.uuid ?? null,
    });
  }

  onStatusSelected(applicationStatus: BoardStatusDto) {
    this.selectedApplicationStatus = applicationStatus.statusCode;
    this.updateCard({
      statusCode: applicationStatus.statusCode,
    });
  }

  updateCard(changes: Omit<CardUpdateDto, 'uuid'>) {
    this.cardService
      .updateCard({
        ...changes,
        uuid: this.covenant.card.uuid,
      })
      .then(() => {
        this.isDirty = true;
        this.toastService.showSuccessToast('Card updated');
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.covenant.card.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.cardService
          .updateCard({
            uuid: this.covenant.card.uuid,
            highPriority: !this.covenant.card.highPriority,
            assigneeUuid: this.covenant.card.assignee?.uuid,
          })
          .then(() => {
            this.isDirty = true;
            this.covenant.card.highPriority = !this.covenant.card.highPriority;
          });
      }
    });
  }

  private async reloadCovenant() {
    const covenant = await this.covenantService.fetchByCardUuid(this.covenant.card.uuid);
    if (covenant) {
      this.populateData(covenant);
    }
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.covenant.card.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isDirty = true;
      const toast = this.toastService.showSuccessToast(`Reconsideration moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadCovenant();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
