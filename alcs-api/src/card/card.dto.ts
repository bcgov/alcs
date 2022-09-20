import { AutoMap } from '@automapper/classes';

export class CardUpdateDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  assigneeUuid: string;

  @AutoMap()
  statusUuid: string;

  @AutoMap()
  boardUuid: string;

  @AutoMap()
  status: string;
}
