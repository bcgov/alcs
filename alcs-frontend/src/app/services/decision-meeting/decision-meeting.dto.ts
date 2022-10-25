import { UserDto } from '../user/user.dto';

export type UpcomingMeetingDto = {
  meetingDate: number;
  fileNumber: string;
  applicant: string;
  boardCode: string;
  assignee: UserDto;
};

export type UpcomingMeetingBoardMapDto = Record<string, UpcomingMeetingDto[]>;
