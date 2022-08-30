import { TestBed } from '@angular/core/testing';

import { ApplicationMeetingService } from './application-meeting.service';

describe('ApplicationMeetingService', () => {
  let service: ApplicationMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
