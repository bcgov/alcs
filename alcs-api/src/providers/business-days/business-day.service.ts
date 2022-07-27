import { Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import en from 'dayjs/locale/en';
import * as utc from 'dayjs/plugin/utc';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';
dayjs.extend(utc);

@Injectable()
export class BusinessDayService {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  calculateDays(startDate: Date, endDate: Date) {
    //Change startOf('week') to go to Monday instead of Sunday
    dayjs.locale({
      ...en,
      weekStart: 1,
    });

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    //Calculate the whole weeks between, each week has 5 business days
    //Shift start date to beginning of next week
    //Shift end date to start of its week
    const firstMonday = start.utc().startOf('day').add(1, 'week').day(1);
    const lastMonday = end.utc().startOf('week').day(1);

    const businessDaysBetween = firstMonday.diff(lastMonday, 'week') * -5;

    //Account for trimmed days with specific cases
    //Starts on Weekday
    let startWeekBusinessDays = 0;
    if (start.utc().day() > 0 && start.utc().day() < 6) {
      startWeekBusinessDays = 6 - start.utc().day(); //e.g. Add 5 if Monday
    }

    //Ends on Weekday, max is 4
    let endWeekBusinessDays = 5;
    if (end.utc().day() > 0 && end.utc().day() < 6) {
      endWeekBusinessDays = end.utc().day() - 1; //e.g. Add 0 if Monday
    }

    //Subtract Holidays
    //TODO: Count holidays that fall between these two dates using inBetween

    return businessDaysBetween + startWeekBusinessDays + endWeekBusinessDays;
  }
}
