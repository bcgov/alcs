import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationAmendmentDto } from '../../../../services/application/application-amendment/application-amendment.dto';
import { ApplicationAmendmentService } from '../../../../services/application/application-amendment/application-amendment.service';
import { BoardStatusDto } from '../../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto, UserDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { CardLabel } from '../../../../shared/card/card.component';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

export const AMENDMENT_TYPE_LABEL: CardLabel = {
  label: 'Amendment',
  shortLabel: 'AMEND',
  backgroundColor: '#fff',
  borderColor: '#45F4F4',
  textColor: '#000',
};

@Component({
  selector: 'app-amendment-detail-dialog',
  templateUrl: './amendment-dialog.component.html',
  styleUrls: ['./amendment-dialog.component.scss'],
})
export class AmendmentDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<UserDto[]> | undefined;
  selectedAssignee?: AssigneeDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;
  title?: string;
  amendmentType = AMENDMENT_TYPE_LABEL;

  amendment: ApplicationAmendmentDto = this.data;
  boardStatuses: BoardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  isDirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationAmendmentDto,
    private dialogRef: MatDialogRef<AmendmentDialogComponent>,
    private userService: UserService,
    private cardService: CardService,
    private boardService: BoardService,
    private toastService: ToastService,
    private amendmentService: ApplicationAmendmentService,
    private confirmationDialogService: ConfirmationDialogService
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
      this.dialogRef.close(this.isDirty);
    });

    this.title = this.amendment.application.fileNumber;
  }

  populateData(amendment: ApplicationAmendmentDto) {
    this.amendment = amendment;
    this.selectedAssignee = amendment.card.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationStatus = amendment.card.status.code;
    this.selectedBoard = amendment.card.board.code;
    this.selectedRegion = amendment.application.region.code;
  }

  filterAssigneeList(term: string, item: UserDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onAssigneeSelected(assignee: UserDto) {
    this.selectedAssignee = assignee;
    this.amendment.card.assignee = assignee;
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
        uuid: this.amendment.card.uuid,
      })
      .then(() => {
        this.isDirty = true;
        this.toastService.showSuccessToast('Card updated');
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.amendment.card.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.cardService
          .updateCard({
            uuid: this.amendment.card.uuid,
            highPriority: !this.amendment.card.highPriority,
            assigneeUuid: this.amendment.card.assignee?.uuid,
          })
          .then(() => {
            this.isDirty = true;
            this.amendment.card.highPriority = !this.amendment.card.highPriority;
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
