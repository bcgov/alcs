import { AutoMap } from '@automapper/classes';

export class CardUpdateDto {
  @AutoMap()
  assigneeUuid: string;

  @AutoMap()
  statusUuid: string;

  @AutoMap()
  boardUuid: string;
}
