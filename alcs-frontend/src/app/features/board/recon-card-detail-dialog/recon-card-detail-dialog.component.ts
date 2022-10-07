import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { BoardStatusDto } from '../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../services/board/board.service';
import { CardUpdateDto } from '../../../services/card/card.dto';
import { CardService } from '../../../services/card/card.service';
import { ToastService } from '../../../services/toast/toast.service';
import { UserDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-recon-card-detail-dialog',
  templateUrl: './recon-card-detail-dialog.component.html',
  styleUrls: ['./recon-card-detail-dialog.component.scss'],
})
export class ReconCardDetailDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<UserDto[]> | undefined;
  selectedAssignee?: UserDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;
  title?: string;

  recon: ApplicationReconsiderationDto = this.data;
  boardStatuses: BoardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  isApplicationDirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationReconsiderationDto,
    private dialogRef: MatDialogRef<ReconCardDetailDialogComponent>,
    private userService: UserService,
    private cardService: CardService,
    private boardService: BoardService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.recon = this.data;
    this.selectedAssignee = this.data.card.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationStatus = this.data.card.status.code;
    this.selectedBoard = this.data.card.board.code;
    this.selectedRegion = this.data.application.region.code;

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
    await this.boardService.changeBoard(this.recon.card.uuid, board.code).then(() => {
      this.isApplicationDirty = true;
      this.toastService.showSuccessToast(`Recon moved to ${board.title}`);
    });
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
