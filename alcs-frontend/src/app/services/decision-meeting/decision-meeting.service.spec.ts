import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DecisionMeetingService } from './decision-meeting.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: DecisionMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(DecisionMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
