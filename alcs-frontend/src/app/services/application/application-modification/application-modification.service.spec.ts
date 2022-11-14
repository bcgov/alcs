import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ApplicationModificationService } from './application-modification.service';

describe('ApplicationReconsiderationService', () => {
  let service: ApplicationModificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(ApplicationModificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
