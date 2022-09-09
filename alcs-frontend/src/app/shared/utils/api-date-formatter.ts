import * as dayjs from 'dayjs';

export const formatDateForApi = (date: Date | number) =>
  date ? dayjs(date).startOf('day').add(12, 'hours').valueOf() : date;
