import { ApplicationDocumentDto } from '../application/application-document/application-document.dto';
import { UserDto } from '../user/user.dto';

export type UpcomingMeeting = {
  meetingDate: number;
  fileNumber: string;
  applicant: string;
  boardCode: string;
  assignee: UserDto;
  files: ApplicationDocumentDto[];
};

export type UpcomingMeetingBoardMapDto = Record<string, UpcomingMeeting[]>;
