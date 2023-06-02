import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthenticationService, ROLES } from '../../../../services/authentication/authentication.service';
import { BoardStatusDto } from '../../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardDto, CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-card-dialog',
  template: '<p></p>',
  styleUrls: [],
})
export class CardDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<AssigneeDto[]> | undefined;

  canArchive = false;
  isDirty = false;
  protected card: CardDto | undefined;

  selectedApplicationStatus = '';
  selectedAssignee?: AssigneeDto;
  selectedAssigneeName?: string;
  selectedBoard?: string;
  boardStatuses: BoardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];
  allowedBoards: BoardWithFavourite[] = [];

  constructor(
    private authService: AuthenticationService,
    protected dialog: MatDialogRef<any>,
    protected cardService: CardService,
    protected confirmationDialogService: ConfirmationDialogService,
    protected toastService: ToastService,
    protected userService: UserService,
    protected boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.boardService.$boards.pipe(takeUntil(this.$destroy)).subscribe((boards) => {
      const loadedBoard = boards.find((board) => board.code === this.selectedBoard);
      this.boards = boards;
      this.allowedBoards = this.boards.filter((board) => this.card && board.allowedCardTypes.includes(this.card.type));
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }
    });

    this.authService.$currentUser.pipe(takeUntil(this.$destroy)).subscribe((currentUser) => {
      this.canArchive =
        !!currentUser &&
        !!currentUser.client_roles &&
        (currentUser.client_roles.includes(ROLES.ADMIN) || currentUser.client_roles.includes(ROLES.APP_SPECIALIST));
    });

    this.dialog.backdropClick().subscribe(() => {
      this.dialog.close(this.isDirty);
    });
  }

  populateCardData(card: CardDto) {
    this.card = card;
    this.selectedAssignee = card.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.prettyName;
    this.selectedApplicationStatus = card.status.code;
    this.selectedBoard = card.board.code;
    this.allowedBoards = this.boards.filter((board) => this.card && board.allowedCardTypes.includes(this.card.type));

    this.$users = this.userService.$assignableUsers;
    this.userService.fetchAssignableUsers();

    const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
    if (loadedBoard) {
      this.boardStatuses = loadedBoard.statuses;
    }
  }

  filterAssigneeList(term: string, item: AssigneeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 ||
      item.prettyName.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onArchiveCard() {
    const card = this.card;
    if (card) {
      const answer = this.confirmationDialogService.openDialog({
        body: 'Are you sure you want to archive the card?',
      });
      answer.subscribe(async (answer) => {
        if (answer) {
          const res = await this.cardService.archiveCard(card.uuid);
          if (res) {
            this.toastService.showSuccessToast('Card archived');
            this.dialog.close(true);
          }
        }
      });
    }
  }

  updateCard(changes: Omit<CardUpdateDto, 'uuid'>) {
    if (this.card) {
      this.cardService
        .updateCard({
          ...changes,
          uuid: this.card.uuid,
        })
        .then(() => {
          this.isDirty = true;
          this.toastService.showSuccessToast('Card updated');
        });
    }
  }

  onTogglePriority() {
    const card = this.card;
    if (card) {
      const answer = this.confirmationDialogService.openDialog({
        body: card.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
      });
      answer.subscribe((answer) => {
        if (answer) {
          this.cardService
            .updateCard({
              uuid: card.uuid,
              highPriority: !card.highPriority,
              assigneeUuid: card.assignee?.uuid,
            })
            .then(() => {
              this.isDirty = true;
              card.highPriority = !card.highPriority;
            });
        }
      });
    }
  }

  onAssigneeSelected(assignee: AssigneeDto) {
    const card = this.card;
    if (card) {
      this.selectedAssignee = assignee;
      card.assignee = assignee;
      this.updateCard({
        assigneeUuid: assignee?.uuid ?? null,
      });
    }
  }

  onStatusSelected(applicationStatus: BoardStatusDto) {
    this.selectedApplicationStatus = applicationStatus.statusCode;
    this.updateCard({
      statusCode: applicationStatus.statusCode,
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
