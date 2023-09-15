import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { formatIncomingDate } from './incoming-date.formatter';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getNextDayToUtc = (timestamp: number) => {
  const date = formatIncomingDate(timestamp);
  return dayjs(date).utc().add(1, 'day').startOf('day').toDate();
};

export const getStartOfDayToUtc = (timestamp: number) => {
  const date = formatIncomingDate(timestamp);
  return dayjs(date).utc().startOf('day').toDate();
};
