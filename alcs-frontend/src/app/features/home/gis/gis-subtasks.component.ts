import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { ApplicationStatusDto } from '../../../services/application/application-code.dto';
import { ApplicationSubtaskWithApplicationDto } from '../../../services/application/application-subtask/application-subtask.dto';
import { ApplicationSubtaskService } from '../../../services/application/application-subtask/application-subtask.service';
import { ApplicationService } from '../../../services/application/application.service';
import { HomeService } from '../../../services/home/home.service';
import { UserDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-gis-subtasks',
  templateUrl: './gis-subtasks.component.html',
  styleUrls: ['./gis-subtasks.component.scss'],
})
export class GisSubtasksComponent implements OnInit {
  subtasks: ApplicationSubtaskWithApplicationDto[] = [];
  $users: Observable<UserDto[]> | undefined;
  private statuses: ApplicationStatusDto[] = [];
  private users: UserDto[] = [];

  constructor(
    private homeService: HomeService,
    private applicationService: ApplicationService,
    private userService: UserService,
    private router: Router,
    private applicationSubtaskService: ApplicationSubtaskService
  ) {}

  ngOnInit(): void {
    this.applicationService.$applicationStatuses.subscribe((statuses) => {
      this.statuses = statuses;
    });

    this.$users = this.userService.$users;
    this.userService.$users.subscribe((users) => {
      this.users = users;
    });
    this.userService.fetchUsers();

    this.loadSubtasks();
  }

  private async loadSubtasks() {
    const subtasks = await this.homeService.fetchGisSubtasks();
    this.subtasks = subtasks.map((subtask) => {
      const statusDto = this.statuses.find((status) => status.code === subtask.application.status);
      const userDto = this.users.find((user) => user.uuid === subtask.assignee);
      return {
        ...subtask,
        assignee: userDto ? userDto.name : undefined,
        application: {
          ...subtask.application,
          status: statusDto!.label,
        },
      };
    });

    this.subtasks.sort((a, b) => {
      if (a.application.highPriority === b.application.highPriority) {
        return b.application.activeDays - a.application.activeDays;
      }
      if (a.application.highPriority) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  filterAssigneeList(term: string, item: UserDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  openCard(fileNumber: string, boardCode: string) {
    this.router.navigateByUrl(`/board/${boardCode}?app=${fileNumber}`);
  }

  async onAssigneeSelected(assignee: UserDto, uuid: string) {
    await this.applicationSubtaskService.update(uuid, { assignee: assignee ? assignee.uuid : null });
  }
}
