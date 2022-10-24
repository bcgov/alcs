import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationReconsiderationDto } from '../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { BoardStatusDto } from '../../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto, UserDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { CardLabel } from '../../../../shared/card/card.component';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

export const RECON_TYPE_LABEL: CardLabel = {
  label: 'Reconsideration',
  shortLabel: 'RECON',
  backgroundColor: '#fff',
  borderColor: '#454545',
  textColor: '#000',
};

@Component({
  selector: 'app-recon-detail-dialog',
  templateUrl: './reconsideration-dialog.component.html',
  styleUrls: ['./reconsideration-dialog.component.scss'],
})
export class ReconsiderationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<UserDto[]> | undefined;
  selectedAssignee?: AssigneeDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;
  title?: string;
  reconType = RECON_TYPE_LABEL;

  recon: ApplicationReconsiderationDto = this.data;
  boardStatuses: BoardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  isApplicationDirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationReconsiderationDto,
    private dialogRef: MatDialogRef<ReconsiderationDialogComponent>,
    private userService: UserService,
    private cardService: CardService,
    private boardService: BoardService,
    private toastService: ToastService,
    private reconService: ApplicationReconsiderationService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.populateData(this.data);

    this.$users = this.userService.$users;
    this.userService.fetchUsers();

    this.boardService.$boards.pipe(takeUntil(this.$destroy)).subscribe((boards) => {
      this.boards = boards;
      const loadedBoard = boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }
    });

    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.isApplicationDirty);
    });

    this.title = this.recon.application.fileNumber;
  }

  populateData(recon: ApplicationReconsiderationDto) {
    this.recon = recon;
    this.selectedAssignee = recon.card.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationStatus = recon.card.status.code;
    this.selectedBoard = recon.card.board.code;
    this.selectedRegion = recon.application.region.code;
  }

  filterAssigneeList(term: string, item: UserDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onAssigneeSelected(assignee: UserDto) {
    this.selectedAssignee = assignee;
    this.recon.card.assignee = assignee;
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

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    try {
      await this.boardService.changeBoard(this.recon.card.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isApplicationDirty = true;
      const toast = this.toastService.showSuccessToast(`Reconsideration moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadReconsideration();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  private async reloadReconsideration() {
    const reconsideration = await this.reconService.fetchByCardUuid(this.recon.card.uuid);
    if (reconsideration) {
      this.populateData(reconsideration);
    }
  }

  updateCard(changes: Omit<CardUpdateDto, 'uuid'>) {
    this.cardService
      .updateCard({
        ...changes,
        uuid: this.recon.card.uuid,
      })
      .then(() => {
        this.isApplicationDirty = true;
        this.toastService.showSuccessToast('Card updated');
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.recon.card.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.cardService
          .updateCard({
            uuid: this.recon.card.uuid,
            highPriority: !this.recon.card.highPriority,
            assigneeUuid: this.recon.card.assignee?.uuid,
          })
          .then(() => {
            this.isApplicationDirty = true;
            this.recon.card.highPriority = !this.recon.card.highPriority;
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
