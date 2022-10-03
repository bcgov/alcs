import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationLocalGovernmentService } from './application-local-government.service';

describe('ApplicationLocalGovernmentService', () => {
  let service: ApplicationLocalGovernmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [],
    });
    service = TestBed.inject(ApplicationLocalGovernmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
