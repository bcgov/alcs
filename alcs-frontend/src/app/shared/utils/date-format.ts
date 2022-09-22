import { environment } from '../../../environments/environment';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: environment.dateFormat,
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
    monthLabel: 'MMM',
    monthDayLabel: 'MMM-DD',
  },
};
