//JS does not have the concept of date without time, we have decided to "standardize" dates by using
// the middle of the day to keep them semi-standard
import moment from 'moment-timezone';

export const formatDateForApi = (date: Date | number) =>
  date ? moment(date).tz('Canada/Pacific').startOf('day').valueOf() : date;
