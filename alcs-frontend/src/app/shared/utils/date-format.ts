import { environment } from '../../../environments/environment';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: environment.dateFormat,
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMM YYYY',
    monthLabel: 'MMM',
    monthDayLabel: 'MMM-DD',
    popupHeaderDateLabel: 'YYYY-MMM-DD',
  },
};
