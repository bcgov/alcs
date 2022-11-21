import { AutoMap } from '@automapper/classes';

export abstract class BaseCodeDto {
  @AutoMap()
  label: string;

  @AutoMap()
  code: string;

  @AutoMap()
  description: string;
}
