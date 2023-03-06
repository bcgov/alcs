import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationDto, UpdateApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { AuthenticationService, ROLES } from '../../../../services/authentication/authentication.service';
import { BoardStatusDto } from '../../../../services/board/board.dto';
import { BoardService, BoardWithFavourite } from '../../../../services/board/board.service';
import { CardService } from '../../../../services/card/card.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './application-dialog.component.html',
  styleUrls: ['./application-dialog.component.scss'],
})
export class ApplicationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<AssigneeDto[]> | undefined;
  selectedAssignee?: AssigneeDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;
  cardTitle = '';

  application: ApplicationDto = this.data;
  boardStatuses: BoardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  isApplicationDirty = false;
  canArchive = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDto,
    private dialogRef: MatDialogRef<ApplicationDialogComponent>,
    private userService: UserService,
    private applicationService: ApplicationService,
    private boardService: BoardService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    private cardService: CardService,
    private authService: AuthenticationService
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

    this.authService.$currentUser.pipe(takeUntil(this.$destroy)).subscribe((currentUser) => {
      this.canArchive =
        !!currentUser &&
        !!currentUser.client_roles &&
        (currentUser.client_roles.includes(ROLES.ADMIN) || currentUser.client_roles.includes(ROLES.APP_SPECIALIST));
    });

    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.isApplicationDirty);
    });
  }

  populateData(application: ApplicationDto) {
    this.application = application;
    this.selectedAssignee = application.card!.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.prettyName;
    this.selectedApplicationStatus = application.card!.status.code;
    this.selectedBoard = application.card!.board.code;
    this.selectedRegion = application.region.code;
    this.cardTitle = `${application.fileNumber} (${application.applicant})`;
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
    this.application.card!.assignee = assignee;
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
      await this.boardService.changeBoard(this.application.card!.uuid, board.code);
      const loadedBoard = this.boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }

      this.isApplicationDirty = true;
      const toast = this.toastService.showSuccessToast(`Application moved to ${board.title}`, 'Go to Board');
      toast.onAction().subscribe(() => {
        this.router.navigate(['/board', board.code]);
      });
      await this.reloadApplication();
    } catch (e) {
      this.toastService.showErrorToast('Failed to move to new board');
    }
  }

  async reloadApplication() {
    const application = await this.applicationService.fetchApplication(this.application.fileNumber);
    this.populateData(application);
  }

  updateCard(updates: UpdateApplicationDto) {
    this.applicationService.updateApplicationCard(this.data.card!.uuid, updates).then(() => {
      this.isApplicationDirty = true;
      this.toastService.showSuccessToast('Application updated');
    });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.application.card!.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.applicationService
          .updateApplicationCard(this.application.card!.uuid, {
            highPriority: !this.application.card!.highPriority,
          })
          .then(() => {
            this.isApplicationDirty = true;
            this.application.card!.highPriority = !this.application.card!.highPriority;
            this.toastService.showSuccessToast(
              this.application.card!.highPriority ? 'Priority added' : 'Priority removed'
            );
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onArchiveCard() {
    const card = this.application.card;
    if (card) {
      const answer = this.confirmationDialogService.openDialog({
        body: 'Are you sure you want to archive the card?',
      });
      answer.subscribe(async (answer) => {
        if (answer) {
          const res = await this.cardService.archiveCard(card.uuid);
          if (res) {
            this.toastService.showSuccessToast('Card archived');
            this.dialogRef.close(true);
          }
        }
      });
    }
  }
}
