import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationStatusDto } from '../../../services/application/application-code.dto';
import { ApplicationPartialDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../../services/board/board.service';
import { ReconsiderationDto } from '../../../services/card/card.dto';
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
  applicationStatuses: ApplicationStatusDto[] = [];
  boards: BoardWithFavourite[] = [];

  isApplicationDirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReconsiderationDto,
    private dialogRef: MatDialogRef<ReconCardDetailDialogComponent>,
    private userService: UserService,
    private applicationService: ApplicationService,
    private boardService: BoardService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    console.log('ReconCardDetailDialogComponent', this.data);
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
      assigneeUuid: assignee.uuid,
    });
  }

  onStatusSelected(applicationStatus: ApplicationStatusDto) {
    this.selectedApplicationStatus = applicationStatus.code;
    this.updateCard({
      status: applicationStatus.code,
    });
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    await this.boardService.changeBoard(this.recon.applicationFileNumber, board.code).then(() => {
      this.isApplicationDirty = true;
      this.toastService.showSuccessToast(`Application moved to ${board.title}`);
    });
  }

  updateCard(changes: Omit<ApplicationPartialDto, 'fileNumber'>) {
    this.applicationService
      .updateApplicationCard({
        ...changes,
        fileNumber: this.recon.applicationFileNumber,
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
        this.applicationService
          .updateApplication({
            fileNumber: this.recon.applicationFileNumber,
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
