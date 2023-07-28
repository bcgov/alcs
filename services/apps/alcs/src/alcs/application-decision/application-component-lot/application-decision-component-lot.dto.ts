export class UpdateApplicationDecisionComponentLotDto {
  type: 'Lot' | 'Road Dedication' | null;
  alrArea: number | null;
  size: number | null;
  uuid: string;
}

export class ApplicationDecisionComponentLotDto {
  number: number;
  componentUuid: string;
  type: 'Lot' | 'Road Dedication' | null;
  alrArea: number | null;
  size: number | null;
  uuid: string;
}
