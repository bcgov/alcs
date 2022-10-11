import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ApplicationReconsiderationService } from './application-reconsideration.service';

describe('ApplicationReconsiderationService', () => {
  let service: ApplicationReconsiderationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(ApplicationReconsiderationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
