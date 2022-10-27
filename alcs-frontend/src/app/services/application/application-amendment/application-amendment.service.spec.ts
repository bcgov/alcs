import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ApplicationAmendmentService } from './application-amendment.service';

describe('ApplicationReconsiderationService', () => {
  let service: ApplicationAmendmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(ApplicationAmendmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
