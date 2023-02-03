import { TestBed } from '@angular/core/testing';

import { StatHolidayService } from './stat-holiday.service';

describe('StatHolidayService', () => {
  let service: StatHolidayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatHolidayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
