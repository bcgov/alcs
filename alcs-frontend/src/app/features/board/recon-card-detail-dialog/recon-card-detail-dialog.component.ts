import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { CardStatusDto } from '../../../services/application/application-code.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../../services/board/board.service';
import { CardPartialDto, ReconsiderationDto } from '../../../services/card/card.dto';
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
export class ReconCardDetailDialogComponent implements OnInit {
  $users: Observable<UserDto[]> | undefined;
  selectedAssignee?: UserDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;

  recon: ReconsiderationDto = this.data;
  applicationStatuses: CardStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  isApplicationDirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReconsiderationDto,
    private dialogRef: MatDialogRef<ReconCardDetailDialogComponent>,
    private userService: UserService,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private boardService: BoardService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.recon = this.data;
    this.selectedAssignee = this.data.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationStatus = this.data.statusDetails.code;
    this.selectedBoard = this.data.board;
    this.selectedRegion = this.data.regionDetails?.code;

    this.$users = this.userService.$users;
    this.userService.fetchUsers();

    this.boardService.$boards.subscribe((boards) => {
      this.boards = boards;
    });
    this.applicationService.$applicationStatuses.subscribe((statuses) => {
      this.applicationStatuses = statuses;
    });

    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.isApplicationDirty);
    });
  }

  filterAssigneeList(term: string, item: UserDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onAssigneeSelected(assignee: UserDto) {
    this.selectedAssignee = assignee;
    this.recon.assignee = assignee;
    this.updateCard({
      assigneeUuid: assignee?.uuid ?? null,
    });
  }

  onStatusSelected(applicationStatus: CardStatusDto) {
    this.selectedApplicationStatus = applicationStatus.code;
    this.updateCard({
      statusCode: applicationStatus.code,
    });
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    await this.boardService.changeBoard(this.recon.uuid, board.code).then(() => {
      this.isApplicationDirty = true;
      this.toastService.showSuccessToast(`Application moved to ${board.title}`);
    });
  }

  updateCard(changes: Omit<CardPartialDto, 'uuid'>) {
    this.cardService
      .updateCard({
        ...changes,
        uuid: this.recon.uuid,
      })
      .then(() => {
        this.isApplicationDirty = true;
        this.toastService.showSuccessToast('Application Updated');
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.recon.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.cardService
          .updateCard({
            uuid: this.recon.uuid, // TODO this will be update to card.uuid once we have proper recon
            highPriority: !this.recon.highPriority,
          })
          .then(() => {
            this.isApplicationDirty = true;
            this.recon.highPriority = !this.recon.highPriority;
          });
      }
    });
  }
}
