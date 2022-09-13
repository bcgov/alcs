import * as dayjs from 'dayjs';

//JS does not have the concept of date without time, we have decided to "standardize" dates by using the middle of the day to keep them semi-standard
export const formatDateForApi = (date: Date | number) =>
  date ? dayjs(date).startOf('day').add(12, 'hours').valueOf() : date;
