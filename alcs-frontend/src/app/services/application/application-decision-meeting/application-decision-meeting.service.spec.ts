import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: ApplicationDecisionMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(ApplicationDecisionMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
