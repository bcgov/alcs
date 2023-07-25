import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HomepageSubtaskDto } from '../../../../services/card/card-subtask/card-subtask.dto';
import { CardSubtaskService } from '../../../../services/card/card-subtask/card-subtask.service';
import { AssigneeDto, UserDto } from '../../../../services/user/user.dto';
import {
  COVENANT_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  PLANNING_TYPE_LABEL,
  RECON_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-subtask-table',
  templateUrl: './subtask-table.component.html',
  styleUrls: ['./subtask-table.component.scss'],
})
export class SubtaskTableComponent {
  @Input() subtasks: HomepageSubtaskDto[] = [];
  @Input() users: AssigneeDto[] = [];

  displayedColumns = ['highPriority', 'title', 'type', 'activeDays', 'stage', 'assignee', 'action'];

  MODIFICATION_TYPE_LABEL = MODIFICATION_TYPE_LABEL;
  PLANNING_TYPE_LABEL = PLANNING_TYPE_LABEL;
  COVENANT_TYPE_LABEL = COVENANT_TYPE_LABEL;
  RECON_TYPE_LABEL = RECON_TYPE_LABEL;

  constructor(private router: Router, private cardSubtaskService: CardSubtaskService) {}

  filterAssigneeList(term: string, item: AssigneeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 ||
      item.prettyName.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  async openCard(subtask: HomepageSubtaskDto) {
    await this.router.navigateByUrl(
      `/board/${subtask.card.boardCode}?card=${subtask.card.uuid}&type=${subtask.card.type}`
    );
  }

  async onAssigneeSelected(assignee: UserDto, uuid: string) {
    await this.cardSubtaskService.update(uuid, { assignee: assignee ? assignee.uuid : null });
  }
}
