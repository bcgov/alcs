import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationSubtaskWithApplicationDto } from '../../../services/card/card-subtask/card-subtask.dto';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
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
  public gisUsers: UserDto[] = [];

  constructor(
    private homeService: HomeService,
    private applicationService: ApplicationService,
    private userService: UserService,
    private router: Router,
    private applicationSubtaskService: CardSubtaskService
  ) {}

  ngOnInit(): void {
    this.userService.$users.subscribe((users) => {
      this.gisUsers = users.filter((user) => user.clientRoles.includes('GIS'));
    });
    this.userService.fetchUsers();

    this.loadSubtasks();
  }

  private async loadSubtasks() {
    const subtasks = await this.homeService.fetchGisSubtasks();

    this.subtasks = subtasks.filter((subtask) => subtask.application);

    const reconsiderationSubtasks = this.mapReconsiderationSubtasks(subtasks);
    this.subtasks.push(...reconsiderationSubtasks);

    this.subtasks.sort((a, b) => {
      if (a.application.card.highPriority === b.application.card.highPriority) {
        return b.application.activeDays - a.application.activeDays;
      }
      if (a.application.card.highPriority) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  private mapReconsiderationSubtasks(subtasks: ApplicationSubtaskWithApplicationDto[]) {
    return subtasks
      .filter((subtask) => subtask.reconsideration)
      .map((subtask) => {
        return {
          ...subtask,
          application: {
            ...(subtask.reconsideration.application as any),
            card: subtask.reconsideration.card,
          },
        };
      });
  }

  filterAssigneeList(term: string, item: UserDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  openCard(fileNumber: string, boardCode: string, cardType: string) {
    this.router.navigateByUrl(`/board/${boardCode}?app=${fileNumber}&&type=${cardType}`);
  }

  async onAssigneeSelected(assignee: UserDto, uuid: string) {
    await this.applicationSubtaskService.update(uuid, { assignee: assignee ? assignee.uuid : null });
  }
}
