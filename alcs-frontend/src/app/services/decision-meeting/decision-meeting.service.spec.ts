import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DecisionMeetingService } from './decision-meeting.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ApplicationDecisionMeetingService', () => {
  let service: DecisionMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(DecisionMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
