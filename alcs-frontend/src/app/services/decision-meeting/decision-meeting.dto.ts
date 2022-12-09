import { AssigneeDto } from '../user/user.dto';

export type UpcomingMeetingDto = {
  meetingDate: number;
  fileNumber: string;
  applicant: string;
  boardCode: string;
  assignee: AssigneeDto;
};

export type UpcomingMeetingBoardMapDto = Record<string, UpcomingMeetingDto[]>;
