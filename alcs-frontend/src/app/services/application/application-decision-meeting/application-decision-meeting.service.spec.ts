import { TestBed } from '@angular/core/testing';

import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: ApplicationDecisionMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationDecisionMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
