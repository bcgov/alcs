import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationDetailedDto, ApplicationPartialDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../../services/board/board.service';
import { ToastService } from '../../../services/toast/toast.service';
import { UserDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-card-detail-dialog',
  templateUrl: './card-detail-dialog.component.html',
  styleUrls: ['./card-detail-dialog.component.scss'],
})
export class CardDetailDialogComponent implements OnInit {
  $users: Observable<UserDto[]> | undefined;
  selectedAssignee?: UserDto;
  selectedAssigneeName?: string;
  selectedApplicationType = '';
  selectedBoard?: string;
  selectedRegion?: string;

  application: ApplicationDetailedDto = this.data;
  applicationTypes: ApplicationTypeDto[] = [];
  boards: BoardWithFavourite[] = [];
  regions: ApplicationRegionDto[] = [];

  isApplicationDirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDetailedDto,
    private userService: UserService,
    private applicationService: ApplicationService,
    private boardService: BoardService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.application = this.data;
    this.selectedAssignee = this.data.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationType = this.data.typeDetails.code;
    this.selectedBoard = this.data.board;
    this.selectedRegion = this.data.regionDetails?.code;

    this.$users = this.userService.$users;
    this.userService.fetchUsers();
    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });

    this.boardService.$boards.subscribe((boards) => {
      this.boards = boards;
    });
    this.applicationService.$applicationRegions.subscribe((regions) => {
      this.regions = regions;
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
    this.application.assignee = assignee;
    this.updateCard({
      assigneeUuid: assignee.uuid,
    });
  }

  onTypeSelected(applicationType: ApplicationTypeDto) {
    this.selectedApplicationType = applicationType.code;
    this.updateCard({
      type: applicationType.code,
    });
  }

  async onBoardSelected(board: BoardWithFavourite) {
    this.selectedBoard = board.code;
    await this.boardService.changeBoard(this.application.fileNumber, board.code).then(() => {
      this.isApplicationDirty = true;
      this.toastService.showSuccessToast(`Application moved to ${board.title}`);
    });
  }

  onRegionSelected(region: ApplicationRegionDto) {
    this.selectedRegion = region.code;
    this.updateCard({
      region: region.code,
    });
  }

  onUpdateTextField(cardProperty: string, newValue: string) {
    const updateObject = {
      [cardProperty]: newValue,
    };
    this.updateCard(updateObject);
  }

  updateCard(changes: Omit<ApplicationPartialDto, 'fileNumber'>) {
    this.applicationService
      .updateApplication({
        ...changes,
        fileNumber: this.application.fileNumber,
      })
      .then(() => {
        this.isApplicationDirty = true;
        this.toastService.showSuccessToast('Application Updated');
      });
  }

  onToggleActive() {
    this.applicationService
      .updateApplication({
        fileNumber: this.application.fileNumber,
        paused: !this.application.paused,
      })
      .then(() => {
        this.isApplicationDirty = true;
        this.application.paused = !this.application.paused;
        if (this.application.paused) {
          this.toastService.showSuccessToast('Application Paused');
        } else {
          this.toastService.showSuccessToast('Application Activated');
        }
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.application.highPriority
        ? 'Remove priority from this Application?'
        : 'Add priority to this application?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.applicationService
          .updateApplication({
            fileNumber: this.application.fileNumber,
            highPriority: !this.application.highPriority,
          })
          .then(() => {
            this.isApplicationDirty = true;
            this.application.highPriority = !this.application.highPriority;
          });
      }
    });
  }
}
