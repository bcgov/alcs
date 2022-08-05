import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationTypeDto } from '../../services/application/application-type.dto';
import { ApplicationDetailedDto, ApplicationPartialDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

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
  currentCard: ApplicationDetailedDto = this.data;
  applicationTypes: {
    label: string;
    code: string;
  }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDetailedDto,
    private userService: UserService,
    private applicationService: ApplicationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentCard = this.data;
    this.selectedAssignee = this.data.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationType = this.data.typeDetails.code;
    this.$users = this.userService.$users;
    this.userService.fetchUsers();
    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types.map((type) => ({
        label: type.label,
        code: type.code,
      }));
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
    this.currentCard.assignee = assignee;
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
        fileNumber: this.currentCard.fileNumber,
      })
      .then((r) => {
        this.toastService.showSuccessToast('Application Updated');
      });
  }

  onToggleActive() {
    this.applicationService
      .updateApplication({
        fileNumber: this.currentCard.fileNumber,
        paused: !this.currentCard.paused,
      })
      .then((r) => {
        this.currentCard.paused = !this.currentCard.paused;
        if (this.currentCard.paused) {
          this.toastService.showSuccessToast('Application Paused');
        } else {
          this.toastService.showSuccessToast('Application Activated');
        }
      });
  }
}
