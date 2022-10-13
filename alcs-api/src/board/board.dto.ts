import { AutoMap } from '@automapper/classes';

export class BoardDto {
  @AutoMap()
  code: string;

  @AutoMap()
  title: string;

  @AutoMap()
  decisionMaker: string;

  @AutoMap()
  statuses: BoardStatusDto[];
}

export class BoardSmallDto {
  @AutoMap()
  code: string;

  @AutoMap()
  title: string;

  @AutoMap()
  decisionMaker: string;
}

export class BoardStatusDto {
  @AutoMap()
  order: number;

  label: string;
  statusCode: string;
}
