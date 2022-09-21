import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';
import { UserDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationDocument } from '../application-document/application-document.entity';

export class CreateApplicationDecisionMeetingDto {
  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  applicationFileNumber;
}

export class ApplicationDecisionMeetingDto extends CreateApplicationDecisionMeetingDto {
  @AutoMap()
  @IsString()
  uuid: string;
}

export type UpcomingMeetingBoardMapDto = Record<
  string,
  {
    meetingDate: number;
    fileNumber: string;
    applicant: string;
    boardCode: string;
    assignee: UserDto;
    files: ApplicationDocumentDto[];
  }
>;
