export interface BoardDto {
  code: string;
  title: string;
  decisionMaker: string;
  statuses: BoardStatusDto[];
}

export interface BoardStatusDto {
  order: number;
  label: string;
  statusCode: string;
}
