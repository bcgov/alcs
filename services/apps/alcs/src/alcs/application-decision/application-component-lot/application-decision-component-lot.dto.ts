export class ApplicationDecisionComponentLotDto {
  number: number;
  type: 'Lot' | 'Road Dedication' | null;
  alrArea: number | null;
  size: number | null;
  componentUuid: string;
}
