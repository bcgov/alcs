import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDocumentService } from './application-document.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: ApplicationDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(ApplicationDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
