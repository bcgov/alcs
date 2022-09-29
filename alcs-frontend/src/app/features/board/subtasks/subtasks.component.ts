import { Component, Input, OnInit } from '@angular/core';
import { ApplicationSubtaskDto } from '../../../services/application/application-subtask/application-subtask.dto';
import { ApplicationSubtaskService } from '../../../services/application/application-subtask/application-subtask.service';
import { UserService } from '../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-subtasks[cardUuid]',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.scss'],
})
export class SubtasksComponent implements OnInit {
  @Input() cardUuid: string = '';

  subtasks: ApplicationSubtaskDto[] = [];
  users: Map<string, string> = new Map();

  constructor(
    private subtaskService: ApplicationSubtaskService,
    private userService: UserService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.loadSubtasks(this.cardUuid);

    this.userService.$users.subscribe((users) => {
      this.users.clear();
      users.forEach((user) => {
        this.users.set(user.uuid, user.initials);
      });
    });
  }

  private async loadSubtasks(fileNumber: string) {
    this.subtasks = await this.subtaskService.fetch(fileNumber);
  }

  async create(type: string) {
    const task = await this.subtaskService.create(this.cardUuid, type);
    this.subtasks.push(task);
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
}
