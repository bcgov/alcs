import { AutoMap } from '@automapper/classes';

export class ApplicationDecisionMeetingDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  date: number;
}
