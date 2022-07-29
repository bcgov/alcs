import { AutoMap } from '@automapper/classes';

export abstract class BaseCodeDto {
  @AutoMap()
  code: string;

  @AutoMap()
  description: string;
}
