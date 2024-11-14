import { CardType } from '../../shared/card/card.component';
import { AssigneeDto } from '../user/user.dto';

export type UpcomingMeetingDto = {
  meetingDate: number;
  fileNumber: string;
  applicant: string;
  boardCode: string;
  assignee: AssigneeDto;
  type: CardType;
  isPaused: boolean;
};

export type UpcomingMeetingBoardMapDto = Record<string, UpcomingMeetingDto[]>;
