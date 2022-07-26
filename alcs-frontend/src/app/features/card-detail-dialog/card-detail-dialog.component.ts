import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';
import { ApplicationDto, ApplicationPartialDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';

@Component({
  selector: 'app-card-detail-dialog',
  templateUrl: './card-detail-dialog.component.html',
  styleUrls: ['./card-detail-dialog.component.scss'],
})
export class CardDetailDialogComponent implements OnInit {
  assignees: UserDto[] = [];
  filteredAssignees?: UserDto[] = [];
  selectedAssignee?: UserDto;
  selectedAssigneeEmail: string = '';
  currentCard: ApplicationPartialDto = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDto,
    private readonly userService: UserService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.currentCard = this.data;
    this.selectedAssignee = this.data.assignee;
    this.selectedAssigneeEmail = this.selectedAssignee?.email || '';
    this.userService.$users.subscribe((users) => {
      this.assignees = users;
      this.filteredAssignees = this.assignees;
    });

    this.userService.fetchUsers();
  }

  filterAssigneeList(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.filteredAssignees = this.assignees.filter((option) => option.email?.toLowerCase().includes(filterValue));
  }

  onAssigneeSelected(assigneeEmail: string) {
    console.log('onAssigneeSelected', assigneeEmail);
    this.selectedAssignee = this.assignees.find((assignee) => assignee.email === assigneeEmail);
    this.currentCard.assignee = this.selectedAssignee;
    console.log('onAssigneeSelected', this.currentCard.assignee);
    this.updateCard(this.currentCard);
  }

  updateCard(currentCard: ApplicationPartialDto) {
    this.applicationService
      .updateApplication({
        fileNumber: currentCard.fileNumber,
        assigneeUuid: currentCard?.assignee?.uuid,
      })
      .then((r) => {
        //TODO: Move this to a toast
        console.log('Application Updated');
      });
  }
}
