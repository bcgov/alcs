import { UserDto } from '../../user/user.dto';

export type IncomingFileDto = {
  fileNumber: string;
  applicant: string;
  boardCode: string;
  type: string;
  assignee: UserDto;
  highPriority: boolean;
  activeDays: number;
};

export type IncomingFileBoardMapDto = Record<string, IncomingFileDto[]>;
