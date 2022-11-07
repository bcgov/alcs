import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CardSubtaskDto, CARD_SUBTASK_TYPE } from '../../../services/card/card-subtask/card-subtask.dto';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { AssigneeDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-subtasks[cardUuid]',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.scss'],
})
export class SubtasksComponent implements OnInit, OnDestroy {
  @Input() cardUuid: string = '';

  $destroy = new Subject<void>();
  subtasks: CardSubtaskDto[] = [];
  users: Map<string, AssigneeDto> = new Map();
  hasAuditSubtask = true;

  constructor(
    private subtaskService: CardSubtaskService,
    private userService: UserService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.loadSubtasks(this.cardUuid);

    this.userService.$assignableUsers.pipe(takeUntil(this.$destroy)).subscribe((users) => {
      this.users.clear();
      users.forEach((user) => {
        this.users.set(user.uuid, user);
      });
    });
  }

  private async loadSubtasks(fileNumber: string) {
    this.subtasks = await this.subtaskService.fetch(fileNumber);
    this.hasAuditSubtask = this.subtasks.some((s) => s.type.code === CARD_SUBTASK_TYPE.AUDIT);
  }

  async create(type: string) {
    await this.subtaskService.create(this.cardUuid, type);
    await this.loadSubtasks(this.cardUuid);
  }

  async onDelete(uuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete this Subtask?',
      })
      .subscribe(async (yes) => {
        if (yes) {
          await this.subtaskService.delete(uuid);
          await this.loadSubtasks(this.cardUuid);
        }
      });
  }

  async completeTask(uuid: string) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to complete this Subtask?',
      })
      .subscribe(async (yes) => {
        if (yes) {
          await this.subtaskService.update(uuid, {
            completedAt: Date.now(),
          });
          await this.loadSubtasks(this.cardUuid);
        }
      });
  }

  async uncompleteSubtask(uuid: string) {
    await this.subtaskService.update(uuid, {
      completedAt: null,
    });
    await this.loadSubtasks(this.cardUuid);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
