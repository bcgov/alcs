import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommissionerService } from './commissioner.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CommissionerService', () => {
  let service: CommissionerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(CommissionerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
