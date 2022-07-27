import { UserDto } from '../../services/user/user.dto';

export interface ApplicationDto {
  fileNumber: string;
  title: string;
  body: string;
  status: string;
  assignee?: UserDto;
  activeDays: number;
  pausedDays: number;
}

export interface ApplicationPartialDto {
  fileNumber: string;
  title?: string;
  body?: string;
  status?: string;
  assigneeUuid?: string;
  assignee?: UserDto;
}
