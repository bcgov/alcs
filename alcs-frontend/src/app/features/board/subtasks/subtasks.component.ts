import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApplicationSubtaskDto } from '../../../services/application/application-subtask/application-subtask.dto';
import { ApplicationSubtaskService } from '../../../services/application/application-subtask/application-subtask.service';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-subtasks[fileNumber]',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.scss'],
})
export class SubtasksComponent implements OnInit {
  @Input() fileNumber: string = '';

  dateFormat = environment.dateFormat;

  subtasks: ApplicationSubtaskDto[] = [];
  users: Map<string, string> = new Map();

  constructor(private subtaskService: ApplicationSubtaskService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadSubtasks(this.fileNumber);

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
    const task = await this.subtaskService.create(this.fileNumber, type);
    this.subtasks.push(task);
  }

  async onDelete(uuid: string) {
    await this.subtaskService.delete(uuid);
    await this.loadSubtasks(this.fileNumber);
  }

  async completeTask(uuid: string) {
    await this.subtaskService.update(uuid, {
      completedAt: Date.now(),
    });
    await this.loadSubtasks(this.fileNumber);
  }

  async uncompleteSubtask(uuid: string) {
    await this.subtaskService.update(uuid, {
      completedAt: null,
    });
    await this.loadSubtasks(this.fileNumber);
  }
}
