import { UserDto } from '../../user/user.dto';

export type IncomingFileDto = {
  fileNumber: string;
  applicant: string;
  boardCode: string;
  type: string;
  assignee: UserDto | null;
  highPriority: boolean;
  activeDays: number;
  isPaused: boolean;
};

export type IncomingFileBoardMapDto = Record<string, IncomingFileDto[]>;
