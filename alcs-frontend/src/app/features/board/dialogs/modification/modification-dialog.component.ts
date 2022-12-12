import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationModificationDto } from '../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../services/application/application-modification/application-modification.service';
import { BoardStatusDto } from '../../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { MODIFICATION_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-modification-detail-dialog',
  templateUrl: './modification-dialog.component.html',
  styleUrls: ['./modification-dialog.component.scss'],
})
export class ModificationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<AssigneeDto[]> | undefined;
  selectedAssignee?: AssigneeDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;
  title?: string;
  modificationType = MODIFICATION_TYPE_LABEL;

  modification: ApplicationModificationDto = this.data;
  boardStatuses: BoardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  isDirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationModificationDto,
    private dialogRef: MatDialogRef<ModificationDialogComponent>,
    private userService: UserService,
    private cardService: CardService,
    private boardService: BoardService,
    private toastService: ToastService,
    private modificationService: ApplicationModificationService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.populateData(this.data);

    this.$users = this.userService.$assignableUsers;
    this.userService.fetchAssignableUsers();

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

    this.title = this.modification.application.fileNumber;
  }

  populateData(modification: ApplicationModificationDto) {
    this.modification = modification;
    this.selectedAssignee = modification.card.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationStatus = modification.card.status.code;
    this.selectedBoard = modification.card.board.code;
    this.selectedRegion = modification.application.region.code;
  }

  filterAssigneeList(term: string, item: AssigneeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onAssigneeSelected(assignee: AssigneeDto) {
    this.selectedAssignee = assignee;
    this.modification.card.assignee = assignee;
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
        uuid: this.modification.card.uuid,
      })
      .then(() => {
        this.isDirty = true;
        this.toastService.showSuccessToast('Card updated');
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.modification.card.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.cardService
          .updateCard({
            uuid: this.modification.card.uuid,
            highPriority: !this.modification.card.highPriority,
            assigneeUuid: this.modification.card.assignee?.uuid,
          })
          .then(() => {
            this.isDirty = true;
            this.modification.card.highPriority = !this.modification.card.highPriority;
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
