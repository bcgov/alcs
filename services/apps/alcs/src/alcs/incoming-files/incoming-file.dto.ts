import { UserDto } from '../../user/user.dto';

export type IncomingFileDto = {
  fileNumber: string;
  applicant: string;
  boardCode: string;
  type: string;
  assignee: UserDto;
};

export type IncomingFileBoardMapDto = Record<string, IncomingFileDto[]>;
