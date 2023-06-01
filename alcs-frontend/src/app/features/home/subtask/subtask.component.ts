import { Component, Input, OnInit } from '@angular/core';
import { ROLES } from '../../../services/authentication/authentication.service';
import { CARD_SUBTASK_TYPE, HomepageSubtaskDto } from '../../../services/card/card-subtask/card-subtask.dto';
import { HomeService } from '../../../services/home/home.service';
import { AssigneeDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { CardType } from '../../../shared/card/card.component';

@Component({
  selector: 'app-subtask',
  templateUrl: './subtask.component.html',
  styleUrls: ['./subtask.component.scss'],
})
export class SubtaskComponent implements OnInit {
  @Input() subtaskType: CARD_SUBTASK_TYPE = CARD_SUBTASK_TYPE.AUDIT;
  @Input() subtaskLabel = 'Set Please';
  @Input() assignableRoles = [ROLES.LUP, ROLES.APP_SPECIALIST];

  totalSubtaskCount = 0;
  public users: AssigneeDto[] = [];
  applicationSubtasks: HomepageSubtaskDto[] = [];
  noticeOfIntentSubtasks: HomepageSubtaskDto[] = [];
  nonApplicationSubtasks: HomepageSubtaskDto[] = [];

  constructor(private homeService: HomeService, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.$assignableUsers.subscribe((users) => {
      this.users = users.filter((user) => user.clientRoles.some((role) => this.assignableRoles.includes(role)));
    });
    this.userService.fetchAssignableUsers();

    this.loadSubtasks();
  }

  private async loadSubtasks() {
    const allSubtasks = await this.homeService.fetchSubtasks(this.subtaskType);
    const applications = allSubtasks.filter((s) => s.card.type === CardType.APP);
    const reconsiderations = allSubtasks.filter((s) => s.card.type === CardType.RECON);
    const planningReviews = allSubtasks.filter((s) => s.card.type === CardType.PLAN);
    const modifications = allSubtasks.filter((s) => s.card.type === CardType.MODI);
    const covenants = allSubtasks.filter((s) => s.card.type === CardType.COV);
    const nois = allSubtasks.filter((s) => s.card.type === CardType.NOI);

    this.applicationSubtasks = [
      ...applications.filter((a) => a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
      ...modifications.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...reconsiderations.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...applications.filter((a) => !a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
      ...modifications.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...reconsiderations.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
    ];

    this.noticeOfIntentSubtasks = [
      ...nois.filter((a) => a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
      ...nois.filter((a) => !a.card.highPriority).sort((a, b) => b.activeDays! - a.activeDays!),
    ];

    this.nonApplicationSubtasks = [
      ...planningReviews.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...covenants.filter((r) => r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...planningReviews.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
      ...covenants.filter((r) => !r.card.highPriority).sort((a, b) => a.createdAt! - b.createdAt!),
    ];

    this.totalSubtaskCount =
      this.applicationSubtasks.length + this.noticeOfIntentSubtasks.length + this.nonApplicationSubtasks.length;
  }
}
