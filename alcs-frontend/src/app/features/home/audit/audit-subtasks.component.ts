import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CARD_SUBTASK_TYPE, HomepageSubtaskDto } from '../../../services/card/card-subtask/card-subtask.dto';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { HomeService } from '../../../services/home/home.service';
import { UserDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { CardType } from '../../../shared/card/card.component';
@Component({
  selector: 'app-audit-subtasks',
  templateUrl: './audit-subtasks.component.html',
  styleUrls: ['./audit-subtasks.component.scss'],
})
export class AuditSubtasksComponent implements OnInit {
  subtasks: MatTableDataSource<HomepageSubtaskDto> = new MatTableDataSource();
  public users: UserDto[] = [];
  displayedColumns = ['highPriority', 'title', 'activeDays', 'stage', 'assignee', 'action'];

  constructor(
    private homeService: HomeService,
    private userService: UserService,
    private router: Router,
    private cardSubtaskService: CardSubtaskService
  ) {}

  ngOnInit(): void {
    this.userService.$users.subscribe((users) => {
      this.users = users;
    });
    this.userService.fetchUsers();

    this.loadSubtasks();
  }

  private async loadSubtasks() {
    const nonOrderedSubtasks = await this.homeService.fetchSubtasks(CARD_SUBTASK_TYPE.AUDIT.valueOf());
    const applications = nonOrderedSubtasks.filter((s) => s.card.type === CardType.APP);
    const reconsiderations = nonOrderedSubtasks.filter((s) => s.card.type === CardType.RECON);
    const planningReviews = nonOrderedSubtasks.filter((s) => s.card.type === CardType.PLAN);
    const amendments = nonOrderedSubtasks.filter((s) => s.card.type === CardType.AMEND);

    const sortedSubtasks = [
      // high priority
      ...applications.filter((a) => a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
      ...amendments.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...reconsiderations.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...planningReviews.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      // none high priority
      ...applications.filter((a) => !a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
      ...amendments.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...reconsiderations.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...planningReviews.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
    ];
    this.subtasks = new MatTableDataSource(sortedSubtasks);
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
