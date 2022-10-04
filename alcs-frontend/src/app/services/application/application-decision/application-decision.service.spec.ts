import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDecisionService } from './application-decision.service';

describe('ApplicationMeetingService', () => {
  let service: ApplicationDecisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(ApplicationDecisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
