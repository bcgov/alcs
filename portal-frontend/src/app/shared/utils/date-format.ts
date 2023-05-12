import { environment } from '../../../environments/environment';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MMM-DD',
  },
  display: {
    dateInput: environment.dateFormat,
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
    monthLabel: 'MMM',
    monthDayLabel: 'MMM-DD',
    popupHeaderDateLabel: 'YYYY-MMM-DD',
  },
};
