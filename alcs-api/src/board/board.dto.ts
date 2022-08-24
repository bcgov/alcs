import { AutoMap } from '@automapper/classes';
import { Column } from 'typeorm';
import { BoardStatus } from './board-status.entity';

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

export class BoardStatusDto {
  @AutoMap()
  order: number;

  label: string;
  statusCode: string;
}
