//JS does not have the concept of date without time, we have decided to "standardize" dates by using
// the middle of the day to keep them semi-standard
import * as moment from 'moment';

export const formatDateForApi = (date: Date | number) =>
  date ? moment(date).startOf('day').add(12, 'hours').valueOf() : date;
