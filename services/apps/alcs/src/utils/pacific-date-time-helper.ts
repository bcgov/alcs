import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { formatIncomingDate } from './incoming-date.formatter';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getNextDayToPacific = (timestamp: number) => {
  const date = formatIncomingDate(timestamp);
  return dayjs(date).tz('Canada/Pacific').add(1, 'day').startOf('day').toDate();
};

export const getStartOfDayToPacific = (timestamp: number) => {
  const date = formatIncomingDate(timestamp);
  return dayjs(date).tz('Canada/Pacific').startOf('day').toDate();
};

export const isDST = () => {
  const timezone = 'America/Vancouver';
  const jul = dayjs('2021-07-01').tz(timezone).utcOffset();
  return jul === dayjs().tz(timezone).utcOffset();
};
