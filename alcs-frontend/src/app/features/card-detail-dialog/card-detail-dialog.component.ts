import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';
import { ApplicationDetailedDto, ApplicationDto, ApplicationPartialDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';

@Component({
  selector: 'app-card-detail-dialog',
  templateUrl: './card-detail-dialog.component.html',
  styleUrls: ['./card-detail-dialog.component.scss'],
})
export class CardDetailDialogComponent implements OnInit {
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  selectedAssignee?: UserDto;
  selectedAssigneeEmail: string = '';
  currentCard: ApplicationDetailedDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDetailedDto,
    private readonly userService: UserService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.currentCard = this.data;
    this.selectedAssignee = this.data.assignee;
    this.selectedAssigneeEmail = this.selectedAssignee?.email || '';
    this.userService.$users.subscribe((users) => {
      this.users = users;
      this.filteredUsers = this.users;
    });

    this.userService.fetchUsers();
  }

  filterAssigneeList(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.users.filter((option) => option.email?.toLowerCase().includes(filterValue));
  }

  onAssigneeSelected(assigneeEmail: string) {
    this.selectedAssignee = this.users.find((user) => user.email === assigneeEmail);
    this.currentCard.assignee = this.selectedAssignee;
    this.updateCard(this.currentCard);
  }

  updateCard(currentCard: ApplicationPartialDto) {
    this.applicationService
      .updateApplication({
        fileNumber: currentCard.fileNumber,
        assigneeUuid: currentCard?.assignee?.uuid || '',
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
