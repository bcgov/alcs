import { AutoMap } from 'automapper-classes';
import { IsNumber, IsString } from 'class-validator';
import { UserDto } from '../../user/user.dto';

export class CreateApplicationDecisionMeetingDto {
  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  applicationFileNumber;
}

export class DecisionMeetingDto extends CreateApplicationDecisionMeetingDto {
  @AutoMap()
  @IsString()
  uuid: string;
}

export type UpcomingMeetingDto = {
  meetingDate: number;
  fileNumber: string;
  applicant: string;
  boardCode: string;
  type: string;
  assignee: UserDto;
  isPaused: boolean;
};

export type UpcomingMeetingBoardMapDto = Record<string, UpcomingMeetingDto[]>;
