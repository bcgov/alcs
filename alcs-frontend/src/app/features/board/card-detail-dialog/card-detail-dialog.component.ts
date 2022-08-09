import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import {
  ApplicationDecisionMakerDto,
  ApplicationRegionDto,
  ApplicationTypeDto,
} from '../../services/application/application-code.dto';
import { ApplicationDetailedDto, ApplicationPartialDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';

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
  selectedDecisionMaker?: string;
  selectedRegion?: string;

  currentCard: ApplicationDetailedDto = this.data;
  applicationTypes: ApplicationTypeDto[] = [];
  decisionMakers: ApplicationDecisionMakerDto[] = [];
  regions: ApplicationRegionDto[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDetailedDto,
    private userService: UserService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.currentCard = this.data;
    this.selectedAssignee = this.data.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationType = this.data.typeDetails.code;
    this.selectedDecisionMaker = this.data.decisionMakerDetails?.code;
    this.selectedRegion = this.data.regionDetails?.code;

    this.$users = this.userService.$users;
    this.userService.fetchUsers();
    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });
    this.applicationService.$applicationDecisionMakers.subscribe((dms) => {
      this.decisionMakers = dms;
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

  onDecisionMakerSelected(decisionMaker: ApplicationDecisionMakerDto) {
    this.selectedDecisionMaker = decisionMaker.code;
    this.updateCard({
      decisionMaker: decisionMaker.code,
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
        fileNumber: this.currentCard.fileNumber,
      })
      .then(() => {
        this.toastService.showSuccessToast('Application Updated');
      });
  }

  onToggleActive() {
    this.applicationService
      .updateApplication({
        fileNumber: this.currentCard.fileNumber,
        paused: !this.currentCard.paused,
      })
      .then(() => {
        this.currentCard.paused = !this.currentCard.paused;
        if (this.currentCard.paused) {
          this.toastService.showSuccessToast('Application Paused');
        } else {
          this.toastService.showSuccessToast('Application Activated');
        }
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.currentCard.highPriority
        ? 'Remove priority from this Application?'
        : 'Add priority to this application?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.applicationService
          .updateApplication({
            fileNumber: this.currentCard.fileNumber,
            highPriority: !this.currentCard.highPriority,
          })
          .then(() => {
            this.currentCard.highPriority = !this.currentCard.highPriority;
          });
      }
    });
  }
}
