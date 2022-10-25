import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService } from '../../../services/application/application.service';
import { HomepageSubtaskDto } from '../../../services/card/card-subtask/card-subtask.dto';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { HomeService } from '../../../services/home/home.service';
import { UserDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { CardType } from '../../../shared/card/card.component';

@Component({
  selector: 'app-gis-subtasks',
  templateUrl: './gis-subtasks.component.html',
  styleUrls: ['./gis-subtasks.component.scss'],
})
export class GisSubtasksComponent implements OnInit {
  subtasks: HomepageSubtaskDto[] = [];
  public gisUsers: UserDto[] = [];

  constructor(
    private homeService: HomeService,
    private applicationService: ApplicationService,
    private userService: UserService,
    private router: Router,
    private cardSubtaskService: CardSubtaskService
  ) {}

  ngOnInit(): void {
    this.userService.$users.subscribe((users) => {
      this.gisUsers = users.filter((user) => user.clientRoles.includes('GIS'));
    });
    this.userService.fetchUsers();

    this.loadSubtasks();
  }

  private async loadSubtasks() {
    const noneOrderedSubtasks = await this.homeService.fetchGisSubtasks();
    const applications = noneOrderedSubtasks.filter((s) => s.card.type === CardType.APP);
    const reconsiderations = noneOrderedSubtasks.filter((s) => s.card.type === CardType.RECON);
    const planningReviews = noneOrderedSubtasks.filter((s) => s.card.type === CardType.PLAN);

    this.subtasks.push(
      // high priority
      ...applications.filter((a) => a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
      ...reconsiderations.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...planningReviews.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      // none high priority
      ...applications.filter((a) => !a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
      ...reconsiderations.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...planningReviews.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!)
    );
  }

  filterAssigneeList(term: string, item: UserDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  openCard(subtask: HomepageSubtaskDto) {
    this.router.navigateByUrl(`/board/${subtask.card.board.code}?card=${subtask.card.uuid}&type=${subtask.card.type}`);
  }

  async onAssigneeSelected(assignee: UserDto, uuid: string) {
    await this.cardSubtaskService.update(uuid, { assignee: assignee ? assignee.uuid : null });
  }
}
