import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';
import { ApplicationDetailedDto, ApplicationPartialDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';

@Component({
  selector: 'app-card-detail-dialog',
  templateUrl: './card-detail-dialog.component.html',
  styleUrls: ['./card-detail-dialog.component.scss'],
})
export class CardDetailDialogComponent implements OnInit {
  $users: Observable<UserDto[]> | undefined;
  selectedAssignee?: UserDto;
  selectedAssigneeName?: string;
  currentCard: ApplicationDetailedDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDetailedDto,
    private readonly userService: UserService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.currentCard = this.data;
    this.selectedAssignee = this.data.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.$users = this.userService.$users;
    this.userService.fetchUsers();
  }

  filterAssigneeList(term: string, item: UserDto) {
    term = term.toLocaleLowerCase();
    return item.email.toLocaleLowerCase().indexOf(term) > -1 || item.name.toLocaleLowerCase().indexOf(term) > -1;
  }

  onAssigneeSelected(assignee: UserDto) {
    console.log(assignee);
    this.selectedAssignee = assignee;
    this.currentCard.assignee = assignee;
    this.updateCard(this.currentCard);
  }

  updateCard(currentCard: ApplicationPartialDto) {
    this.applicationService
      .updateApplication({
        fileNumber: currentCard.fileNumber,
        assigneeUuid: currentCard?.assignee?.uuid || null,
      })
      .then((r) => {
        //TODO: Move this to a toast
        console.log('Application Updated');
      });
  }

  // placeholders
  paused: boolean = true;

  onToggle() {
    this.paused = !this.paused;
  }
}
