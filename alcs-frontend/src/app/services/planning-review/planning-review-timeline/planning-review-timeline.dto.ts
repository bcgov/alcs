export interface TimelineEventDto {
  htmlText: string;
  startDate: number;
  fulfilledDate: number | null;
  isFulfilled: boolean;
  link: string | null;
}
