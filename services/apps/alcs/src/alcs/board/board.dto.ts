import { AutoMap } from '@automapper/classes';

export enum BOARD_CODES {
  CEO = 'ceo',
  SOIL = 'soil',
  EXECUTIVE_COMMITTEE = 'exec',
}

export class BoardDto {
  @AutoMap()
  code: string;

  @AutoMap()
  title: string;

  @AutoMap()
  decisionMaker: string;

  @AutoMap()
  statuses: BoardStatusDto[];

  allowedCardTypes: string[];
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
