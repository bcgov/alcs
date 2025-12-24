import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationLocalGovernmentService } from './application-local-government.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ApplicationLocalGovernmentService', () => {
  let service: ApplicationLocalGovernmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ApplicationLocalGovernmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
